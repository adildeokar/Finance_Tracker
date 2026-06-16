from datetime import date
from typing import List, Literal, Optional

from pydantic import BaseModel, EmailStr


class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    currency: Optional[str] = "INR"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class ChangePassword(BaseModel):
    current_password: str
    new_password: str


class AccountCreate(BaseModel):
    name: str
    type: Literal["credit_card", "savings", "debit_card", "wallet", "cash"]
    last_four: Optional[str] = None
    color: Optional[str] = "#6366f1"
    credit_limit: Optional[float] = None
    current_balance: Optional[float] = 0
    billing_date: Optional[int] = None
    due_date: Optional[int] = None


class AccountUpdate(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None
    credit_limit: Optional[float] = None
    current_balance: Optional[float] = None
    billing_date: Optional[int] = None
    due_date: Optional[int] = None
    is_active: Optional[bool] = None


class CategoryCreate(BaseModel):
    name: str
    color: str = "#6366f1"
    icon: str = "💸"
    type: Literal["expense", "income", "both"] = "expense"


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None
    icon: Optional[str] = None
    type: Optional[str] = None


class ExpenseCreate(BaseModel):
    title: str
    amount: float
    type: Literal["expense", "income", "transfer"] = "expense"
    category_id: Optional[str] = None
    account_id: Optional[str] = None
    date: date
    notes: Optional[str] = None
    tags: Optional[List[str]] = []
    receipt_url: Optional[str] = None


class ExpenseUpdate(BaseModel):
    title: Optional[str] = None
    amount: Optional[float] = None
    type: Optional[Literal["expense", "income", "transfer"]] = None
    category_id: Optional[str] = None
    account_id: Optional[str] = None
    date: Optional[date] = None
    notes: Optional[str] = None
    tags: Optional[List[str]] = None


class BulkExpenseCreate(BaseModel):
    expenses: List[ExpenseCreate]


class BudgetCreate(BaseModel):
    category_id: str
    monthly_limit: float
    month: int
    year: int
    alert_threshold: Optional[int] = 80


class BudgetUpdate(BaseModel):
    monthly_limit: Optional[float] = None
    alert_threshold: Optional[int] = None


class RecurringCreate(BaseModel):
    title: str
    amount: float
    type: Literal["expense", "income"] = "expense"
    category_id: Optional[str] = None
    account_id: Optional[str] = None
    frequency: Literal["daily", "weekly", "monthly", "yearly"] = "monthly"
    day_of_month: Optional[int] = None
    start_date: date
    end_date: Optional[date] = None


class RecurringUpdate(BaseModel):
    title: Optional[str] = None
    amount: Optional[float] = None
    is_active: Optional[bool] = None
    end_date: Optional[date] = None
    day_of_month: Optional[int] = None


class GoalCreate(BaseModel):
    title: str
    target_amount: float
    account_id: Optional[str] = None
    target_date: Optional[date] = None
    color: Optional[str] = "#22c55e"
    icon: Optional[str] = "🎯"


class GoalUpdate(BaseModel):
    title: Optional[str] = None
    target_amount: Optional[float] = None
    current_amount: Optional[float] = None
    target_date: Optional[date] = None
    color: Optional[str] = None
    is_completed: Optional[bool] = None
