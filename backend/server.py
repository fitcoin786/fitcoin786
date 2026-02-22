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
from pycoingecko import CoinGeckoAPI
import random

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'fitcoin_secret_key_change_in_production')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24

# CoinGecko API (for demo - will use mock data for Fitcoin)
cg = CoinGeckoAPI()

security = HTTPBearer()

# Create the main app
app = FastAPI()
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
    order_type: str  # 'buy' or 'sell'
    amount: float
    price: float
    total: float
    status: str  # 'completed', 'pending', 'cancelled'
    created_at: str

class CreateOrder(BaseModel):
    order_type: str
    amount: float
    price: float

class PriceData(BaseModel):
    symbol: str
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
    payload = {
        'user_id': user_id,
        'exp': expiration
    }
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

# ============ PRICE SIMULATION ============

# Base price for Fitcoin (in USD)
FITCOIN_BASE_PRICE = 0.0042
last_fitcoin_price = FITCOIN_BASE_PRICE

def get_simulated_fitcoin_price():
    """Simulate realistic price movements for Fitcoin"""
    global last_fitcoin_price
    # Simulate price change between -2% to +2%
    change_percent = random.uniform(-0.02, 0.02)
    last_fitcoin_price = last_fitcoin_price * (1 + change_percent)
    return last_fitcoin_price

# ============ AUTH ROUTES ============

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(input: UserRegister):
    # Check if user exists
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
    
    # Create initial wallet with demo balance
    wallet_doc = {
        "user_id": user_id,
        "usd_balance": 10000.0,  # Demo balance
        "ftc_balance": 0.0,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.wallets.insert_one(wallet_doc)
    
    token = create_token(user_id)
    user_response = User(
        id=user_id,
        email=input.email,
        full_name=input.full_name,
        created_at=user_doc["created_at"]
    )
    
    return TokenResponse(token=token, user=user_response)

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(input: UserLogin):
    user_doc = await db.users.find_one({"email": input.email}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(input.password, user_doc["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user_doc["id"])
    user_response = User(
        id=user_doc["id"],
        email=user_doc["email"],
        full_name=user_doc["full_name"],
        created_at=user_doc["created_at"]
    )
    
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

@api_router.get("/price/fitcoin", response_model=PriceData)
async def get_fitcoin_price():
    current_price = get_simulated_fitcoin_price()
    change_24h = random.uniform(-5, 15)  # Simulate 24h change
    
    return PriceData(
        symbol="FTC",
        price=current_price,
        change_24h=change_24h,
        volume_24h=random.uniform(50000, 200000),
        market_cap=current_price * 1000000000,  # 1B supply
        last_updated=datetime.now(timezone.utc).isoformat()
    )

@api_router.get("/price/history")
async def get_price_history():
    """Generate mock historical data for charting"""
    now = datetime.now(timezone.utc)
    data = []
    base_price = FITCOIN_BASE_PRICE
    
    # Generate 100 data points (last 100 intervals)
    for i in range(100):
        timestamp = (now - timedelta(minutes=100-i)).timestamp()
        # Simulate OHLC data
        open_price = base_price * random.uniform(0.98, 1.02)
        high = open_price * random.uniform(1.0, 1.03)
        low = open_price * random.uniform(0.97, 1.0)
        close = random.uniform(low, high)
        base_price = close  # Next candle starts where this one closed
        
        data.append({
            "time": int(timestamp),
            "open": round(open_price, 6),
            "high": round(high, 6),
            "low": round(low, 6),
            "close": round(close, 6)
        })
    
    return {"data": data}

# ============ TRADING ROUTES ============

@api_router.post("/trade", response_model=TradeOrder)
async def create_trade(input: CreateOrder, user_id: str = Depends(get_current_user)):
    # Get wallet
    wallet = await db.wallets.find_one({"user_id": user_id}, {"_id": 0})
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
    
    total = input.amount * input.price
    
    # Validate balances
    if input.order_type == "buy":
        if wallet["usd_balance"] < total:
            raise HTTPException(status_code=400, detail="Insufficient USD balance")
        # Update balances
        new_usd = wallet["usd_balance"] - total
        new_ftc = wallet["ftc_balance"] + input.amount
    else:  # sell
        if wallet["ftc_balance"] < input.amount:
            raise HTTPException(status_code=400, detail="Insufficient FTC balance")
        # Update balances
        new_usd = wallet["usd_balance"] + total
        new_ftc = wallet["ftc_balance"] - input.amount
    
    # Update wallet
    await db.wallets.update_one(
        {"user_id": user_id},
        {"$set": {
            "usd_balance": new_usd,
            "ftc_balance": new_ftc,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # Create order record
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
    """Generate simulated order book"""
    current_price = get_simulated_fitcoin_price()
    
    # Generate bids (buy orders) - below current price
    bids = []
    for i in range(15):
        price = current_price * (1 - (i+1) * 0.001)
        amount = random.uniform(1000, 50000)
        bids.append({
            "price": round(price, 6),
            "amount": round(amount, 2),
            "total": round(price * amount, 2)
        })
    
    # Generate asks (sell orders) - above current price
    asks = []
    for i in range(15):
        price = current_price * (1 + (i+1) * 0.001)
        amount = random.uniform(1000, 50000)
        asks.append({
            "price": round(price, 6),
            "amount": round(amount, 2),
            "total": round(price * amount, 2)
        })
    
    return {
        "bids": bids,
        "asks": asks
    }

# ============ MARKET STATS ============

@api_router.get("/market/stats")
async def get_market_stats():
    current_price = get_simulated_fitcoin_price()
    return {
        "ftc": {
            "price": round(current_price, 6),
            "change_24h": round(random.uniform(-5, 15), 2),
            "high_24h": round(current_price * 1.15, 6),
            "low_24h": round(current_price * 0.92, 6),
            "volume_24h": round(random.uniform(50000, 200000), 2)
        }
    }

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()