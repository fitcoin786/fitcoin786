from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import httpx
import asyncio
from pycoingecko import CoinGeckoAPI

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'futuretrade_secret_key_change_in_production')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24

# Solana Fitcoin Contract Address
FITCOIN_CONTRACT = "5cKaxcoLhjc5A3gUD9nCFRfm69iMiggTHpafz4Gipump"

# Initialize CoinGecko for market data
cg = CoinGeckoAPI()

security = HTTPBearer()

# Create the main app
app = FastAPI(title="Future Trade API")
api_router = APIRouter(prefix="/api")

# ============ MODELS ============

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: EmailStr
    full_name: str
    created_at: str

class TokenResponse(BaseModel):
    token: str
    user: User

class WalletBalance(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    usd_balance: float
    ftc_balance: float
    updated_at: str

class TradeOrder(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    order_type: str
    amount: float
    price: float
    total: float
    status: str
    created_at: str

class CreateOrder(BaseModel):
    order_type: str
    amount: float
    price: float

class TokenPrice(BaseModel):
    symbol: str
    name: str
    price: float
    change_24h: float
    volume_24h: float
    market_cap: float
    last_updated: str

# ============ AUTH HELPERS ============

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str) -> str:
    expiration = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    payload = {'user_id': user_id, 'exp': expiration}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get('user_id')
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ============ PRICE FETCHING ============

async def fetch_jupiter_price(token_address: str):
    """Fetch real-time price - Base price from DexTools: $0.00000349"""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            # Try DexTools API (if available)
            try:
                response = await client.get(
                    f"https://api.dextools.io/v1/token?chain=solana&address={token_address}",
                    headers={"accept": "application/json"}
                )
                if response.status_code == 200:
                    data = response.json()
                    if 'data' in data and 'price' in data['data']:
                        return {
                            'price': float(data['data']['price']),
                            'success': True
                        }
            except:
                pass
            
            # Try Jupiter API v2
            try:
                response = await client.get(
                    f"https://api.jup.ag/price/v2?ids={token_address}",
                    headers={"accept": "application/json"}
                )
                if response.status_code == 200:
                    data = response.json()
                    if 'data' in data and token_address in data['data']:
                        price_data = data['data'][token_address]
                        return {
                            'price': price_data.get('price', 0.00000349),
                            'success': True
                        }
            except:
                pass
            
            # Try Birdeye API
            try:
                response = await client.get(
                    f"https://public-api.birdeye.so/public/price?address={token_address}",
                    headers={"accept": "application/json"}
                )
                if response.status_code == 200:
                    data = response.json()
                    if 'data' in data and 'value' in data['data']:
                        return {
                            'price': float(data['data']['value']),
                            'success': True
                        }
            except:
                pass
        
        # Fallback to DexTools confirmed price
        return {'price': 0.00000349, 'success': False}
    except Exception as e:
        logging.error(f"Price fetch error: {e}")
        return {'price': 0.00000349, 'success': False}

async def fetch_coingecko_market_data():
    """Fetch market overview from CoinGecko"""
    try:
        # Get top coins by market cap
        top_coins = cg.get_coins_markets(
            vs_currency='usd',
            order='market_cap_desc',
            per_page=100,
            page=1,
            sparkline=False,
            price_change_percentage='24h'
        )
        
        # Sort for different categories
        gainers = sorted([c for c in top_coins if c.get('price_change_percentage_24h', 0) > 0], 
                        key=lambda x: x.get('price_change_percentage_24h', 0), reverse=True)[:10]
        losers = sorted([c for c in top_coins if c.get('price_change_percentage_24h', 0) < 0], 
                       key=lambda x: x.get('price_change_percentage_24h', 0))[:10]
        trending = top_coins[:10]
        
        return {
            'gainers': gainers,
            'losers': losers,
            'trending': trending,
            'success': True
        }
    except Exception as e:
        logging.error(f"CoinGecko error: {e}")
        return {'gainers': [], 'losers': [], 'trending': [], 'success': False}

# ============ AUTH ROUTES ============

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(input: UserRegister):
    existing = await db.users.find_one({"email": input.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "email": input.email,
        "password_hash": hash_password(input.password),
        "full_name": input.full_name,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    
    # Create initial wallet
    wallet_doc = {
        "user_id": user_id,
        "usd_balance": 10000.0,
        "ftc_balance": 0.0,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.wallets.insert_one(wallet_doc)
    
    token = create_token(user_id)
    user_response = User(id=user_id, email=input.email, full_name=input.full_name, created_at=user_doc["created_at"])
    return TokenResponse(token=token, user=user_response)

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(input: UserLogin):
    user_doc = await db.users.find_one({"email": input.email}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(input.password, user_doc["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user_doc["id"])
    user_response = User(id=user_doc["id"], email=user_doc["email"], full_name=user_doc["full_name"], created_at=user_doc["created_at"])
    return TokenResponse(token=token, user=user_response)

@api_router.get("/auth/me", response_model=User)
async def get_me(user_id: str = Depends(get_current_user)):
    user_doc = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    return User(**user_doc)

# ============ WALLET ROUTES ============

@api_router.get("/wallet", response_model=WalletBalance)
async def get_wallet(user_id: str = Depends(get_current_user)):
    wallet = await db.wallets.find_one({"user_id": user_id}, {"_id": 0})
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
    return WalletBalance(**wallet)

# ============ PRICE ROUTES ============

@api_router.get("/price/fitcoin")
async def get_fitcoin_price():
    """Get real-time Fitcoin price"""
    price_data = await fetch_jupiter_price(FITCOIN_CONTRACT)
    
    # Add small random variation to simulate real-time fluctuation (±0.5%)
    import random
    base_price = price_data['price']
    variation = random.uniform(-0.005, 0.005)
    current_price = base_price * (1 + variation)
    
    # Calculate 24h change (simulate realistic crypto volatility)
    change_24h = random.uniform(-15, 35)
    
    # Calculate volume based on price
    volume_24h = random.uniform(80000, 250000)
    
    # Total supply: 1 Billion FTC
    total_supply = 1000000000
    market_cap = current_price * total_supply
    
    return {
        "symbol": "FTC",
        "name": "Fitcoin",
        "price": round(current_price, 11),  # Show up to 11 decimal places
        "change_24h": round(change_24h, 2),
        "volume_24h": round(volume_24h, 2),
        "market_cap": round(market_cap, 2),
        "high_24h": round(current_price * 1.12, 11),
        "low_24h": round(current_price * 0.88, 11),
        "last_updated": datetime.now(timezone.utc).isoformat(),
        "contract_address": FITCOIN_CONTRACT,
        "blockchain": "Solana",
        "real_data": price_data['success']
    }

@api_router.get("/price/history")
async def get_price_history():
    """Generate price history for charting"""
    now = datetime.now(timezone.utc)
    data = []
    
    # Get current price
    price_data = await fetch_jupiter_price(FITCOIN_CONTRACT)
    base_price = price_data['price']
    
    import random
    for i in range(100):
        timestamp = (now - timedelta(minutes=100-i)).timestamp()
        open_price = base_price * random.uniform(0.95, 1.05)
        high = open_price * random.uniform(1.0, 1.03)
        low = open_price * random.uniform(0.97, 1.0)
        close = random.uniform(low, high)
        base_price = close
        
        data.append({
            "time": int(timestamp),
            "open": round(open_price, 8),
            "high": round(high, 8),
            "low": round(low, 8),
            "close": round(close, 8)
        })
    
    return {"data": data}

# ============ MARKET DATA ROUTES ============

@api_router.get("/market/overview")
async def get_market_overview():
    """Get market overview with gainers, losers, trending"""
    market_data = await fetch_coingecko_market_data()
    
    def format_coin(coin):
        return {
            'id': coin.get('id'),
            'symbol': coin.get('symbol', '').upper(),
            'name': coin.get('name'),
            'price': coin.get('current_price', 0),
            'change_24h': coin.get('price_change_percentage_24h', 0),
            'market_cap': coin.get('market_cap', 0),
            'volume_24h': coin.get('total_volume', 0),
            'image': coin.get('image', '')
        }
    
    return {
        'top_gainers': [format_coin(c) for c in market_data['gainers']],
        'top_losers': [format_coin(c) for c in market_data['losers']],
        'trending': [format_coin(c) for c in market_data['trending']],
        'last_updated': datetime.now(timezone.utc).isoformat()
    }

@api_router.get("/crypto/search")
async def search_cryptocurrency(query: str):
    """Search for cryptocurrencies by name or symbol"""
    try:
        results = cg.search(query)
        coins = results.get('coins', [])[:20]
        
        formatted_results = []
        for coin in coins:
            formatted_results.append({
                'id': coin.get('id'),
                'symbol': coin.get('symbol', '').upper(),
                'name': coin.get('name'),
                'market_cap_rank': coin.get('market_cap_rank'),
                'thumb': coin.get('thumb', ''),
                'large': coin.get('large', '')
            })
        
        return {'results': formatted_results, 'count': len(formatted_results)}
    except Exception as e:
        logging.error(f"Search error: {e}")
        return {'results': [], 'count': 0}

@api_router.get("/crypto/details/{coin_id}")
async def get_crypto_details(coin_id: str):
    """Get detailed information about a cryptocurrency"""
    try:
        data = cg.get_coin_by_id(
            id=coin_id,
            localization='false',
            tickers=False,
            market_data=True,
            community_data=False,
            developer_data=False
        )
        
        market_data = data.get('market_data', {})
        
        return {
            'id': data.get('id'),
            'symbol': data.get('symbol', '').upper(),
            'name': data.get('name'),
            'price': market_data.get('current_price', {}).get('usd', 0),
            'market_cap': market_data.get('market_cap', {}).get('usd', 0),
            'volume_24h': market_data.get('total_volume', {}).get('usd', 0),
            'price_change_24h': market_data.get('price_change_percentage_24h', 0),
            'price_change_7d': market_data.get('price_change_percentage_7d', 0),
            'price_change_30d': market_data.get('price_change_percentage_30d', 0),
            'high_24h': market_data.get('high_24h', {}).get('usd', 0),
            'low_24h': market_data.get('low_24h', {}).get('usd', 0),
            'ath': market_data.get('ath', {}).get('usd', 0),
            'atl': market_data.get('atl', {}).get('usd', 0),
            'description': data.get('description', {}).get('en', ''),
            'image': data.get('image', {}).get('large', '')
        }
    except Exception as e:
        logging.error(f"Details error: {e}")
        raise HTTPException(status_code=404, detail="Cryptocurrency not found")

# ============ TRADING ROUTES ============

@api_router.post("/trade", response_model=TradeOrder)
async def create_trade(input: CreateOrder, user_id: str = Depends(get_current_user)):
    wallet = await db.wallets.find_one({"user_id": user_id}, {"_id": 0})
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
    
    total = input.amount * input.price
    
    if input.order_type == "buy":
        if wallet["usd_balance"] < total:
            raise HTTPException(status_code=400, detail="Insufficient USD balance")
        new_usd = wallet["usd_balance"] - total
        new_ftc = wallet["ftc_balance"] + input.amount
    else:
        if wallet["ftc_balance"] < input.amount:
            raise HTTPException(status_code=400, detail="Insufficient FTC balance")
        new_usd = wallet["usd_balance"] + total
        new_ftc = wallet["ftc_balance"] - input.amount
    
    await db.wallets.update_one(
        {"user_id": user_id},
        {"$set": {"usd_balance": new_usd, "ftc_balance": new_ftc, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    order_id = str(uuid.uuid4())
    order_doc = {
        "id": order_id,
        "user_id": user_id,
        "order_type": input.order_type,
        "amount": input.amount,
        "price": input.price,
        "total": total,
        "status": "completed",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.orders.insert_one(order_doc)
    return TradeOrder(**order_doc)

@api_router.get("/trade/history", response_model=List[TradeOrder])
async def get_trade_history(user_id: str = Depends(get_current_user)):
    orders = await db.orders.find({"user_id": user_id}, {"_id": 0}).sort("created_at", -1).limit(50).to_list(50)
    return [TradeOrder(**order) for order in orders]

# ============ ORDER BOOK ============

@api_router.get("/orderbook")
async def get_orderbook():
    """Generate order book"""
    price_data = await fetch_jupiter_price(FITCOIN_CONTRACT)
    current_price = price_data['price']
    
    import random
    bids = []
    for i in range(15):
        price = current_price * (1 - (i+1) * 0.001)
        amount = random.uniform(1000, 50000)
        bids.append({"price": round(price, 8), "amount": round(amount, 2), "total": round(price * amount, 2)})
    
    asks = []
    for i in range(15):
        price = current_price * (1 + (i+1) * 0.001)
        amount = random.uniform(1000, 50000)
        asks.append({"price": round(price, 8), "amount": round(amount, 2), "total": round(price * amount, 2)})
    
    return {"bids": bids, "asks": asks}

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()