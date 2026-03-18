import pytest
from .conftest import register_and_login, unique_email

pytestmark = [pytest.mark.asyncio, pytest.mark.integration]

# pytestmark = pytest.mark.asyncio


def build_store_payload(name="Analytics Store"):
    return {
        "name": name,
        "branch": "Main Branch",
        "address": "123 Test Road",
        "city": "Dhaka",
        "zone": "Dhanmondi",
        "phone": "01711111111",
        "email": f"{name.lower().replace(' ', '_')}@example.com",
    }


def build_order_payload(store_id):
    return {
        "store_id": store_id,
        "recipient_name": "Karim",
        "recipient_phone": "01710000000",
        "recipient_address": "House 10, Road 3, Dhaka",
        "pickup_address": "Warehouse 1, Dhaka",
        "destination_area": "Dhanmondi",
        "parcel_type": "document",
        "item_description": "Books",
        "item_weight": "1 kg",
        "item_weight_kg": 1.0,
        "amount": 500,
        "payment_method": "cod",
        "cod_amount": 500,
        "notes": "Handle with care",
    }


@pytest.fixture
async def merchant_with_orders(client):
    auth = await register_and_login(client, email=unique_email("analytics_merchant"))

    store_res = await client.post(
        "/api/stores",
        json=build_store_payload(),
        headers=auth["headers"],
    )
    assert store_res.status_code == 201, store_res.text
    store_id = store_res.json()["id"]

    # create a few orders
    for _ in range(3):
        order_res = await client.post(
            "/api/orders",
            json=build_order_payload(store_id),
            headers=auth["headers"],
        )
        assert order_res.status_code == 201, order_res.text

    return {
        "headers": auth["headers"],
        "store_id": store_id,
        "email": auth["email"],
    }


async def test_analytics_requires_auth(client):
    res = await client.get("/api/analytics")
    assert res.status_code == 401


async def test_analytics_returns_required_keys(client, merchant_with_orders):
    res = await client.get("/api/analytics", headers=merchant_with_orders["headers"])
    assert res.status_code == 200, res.text

    data = res.json()
    assert "order_counts" in data
    assert "daily_data" in data
    assert "top_stores" in data


async def test_analytics_order_counts_structure(client, merchant_with_orders):
    res = await client.get("/api/analytics", headers=merchant_with_orders["headers"])
    assert res.status_code == 200, res.text

    order_counts = res.json()["order_counts"]
    assert isinstance(order_counts, dict)

    for key, value in order_counts.items():
        assert isinstance(key, str)
        assert isinstance(value, int)


async def test_analytics_daily_data_structure(client, merchant_with_orders):
    res = await client.get("/api/analytics", headers=merchant_with_orders["headers"])
    assert res.status_code == 200, res.text

    daily_data = res.json()["daily_data"]
    assert isinstance(daily_data, list)

    if daily_data:
        item = daily_data[0]
        assert "date" in item
        assert "count" in item
        assert "revenue" in item


async def test_analytics_top_stores_structure(client, merchant_with_orders):
    res = await client.get("/api/analytics", headers=merchant_with_orders["headers"])
    assert res.status_code == 200, res.text

    top_stores = res.json()["top_stores"]
    assert isinstance(top_stores, list)

    if top_stores:
        item = top_stores[0]
        assert "name" in item
        assert "order_count" in item
        assert "revenue" in item