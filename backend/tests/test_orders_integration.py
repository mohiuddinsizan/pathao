import re
import pytest
from .conftest import register_and_login, unique_email

pytestmark = pytest.mark.asyncio


def build_store_payload(name="Orders Store"):
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
async def merchant_with_store(client):
    auth = await register_and_login(client, email=unique_email("orders_merchant"))

    store_res = await client.post(
        "/api/stores",
        json=build_store_payload(),
        headers=auth["headers"],
    )
    assert store_res.status_code == 201, store_res.text

    return {
        "headers": auth["headers"],
        "store_id": store_res.json()["id"],
        "email": auth["email"],
    }


async def test_create_order(client, merchant_with_store):
    payload = build_order_payload(merchant_with_store["store_id"])

    res = await client.post(
        "/api/orders",
        json=payload,
        headers=merchant_with_store["headers"],
    )

    assert res.status_code == 201, res.text
    body = res.json()
    assert "data" in body
    assert "message" in body

    data = body["data"]
    assert "order_id" in data
    assert re.match(r"^PTH-\d+$", data["order_id"])


async def test_list_orders_pagination(client, merchant_with_store):
    payload = build_order_payload(merchant_with_store["store_id"])
    create_res = await client.post(
        "/api/orders",
        json=payload,
        headers=merchant_with_store["headers"],
    )
    assert create_res.status_code == 201, create_res.text

    res = await client.get(
        "/api/orders?page=1&limit=5",
        headers=merchant_with_store["headers"],
    )

    assert res.status_code == 200, res.text
    body = res.json()
    assert "data" in body

    data = body["data"]
    assert "orders" in data
    assert "total" in data
    assert "page" in data
    assert "limit" in data
    assert "pages" in data
    assert isinstance(data["orders"], list)
    assert isinstance(data["total"], int)
    assert len(data["orders"]) <= 5


async def test_filter_by_status(client, merchant_with_store):
    payload = build_order_payload(merchant_with_store["store_id"])
    create_res = await client.post(
        "/api/orders",
        json=payload,
        headers=merchant_with_store["headers"],
    )
    assert create_res.status_code == 201, create_res.text

    res = await client.get(
        "/api/orders?order_status=pending",
        headers=merchant_with_store["headers"],
    )

    assert res.status_code == 200, res.text
    orders = res.json()["data"]["orders"]

    for order in orders:
        assert order["status"] == "pending"


async def test_get_order_detail(client, merchant_with_store):
    payload = build_order_payload(merchant_with_store["store_id"])
    create_res = await client.post(
        "/api/orders",
        json=payload,
        headers=merchant_with_store["headers"],
    )
    assert create_res.status_code == 201, create_res.text

    order_id = create_res.json()["data"]["order_id"]

    res = await client.get(
        f"/api/orders/{order_id}",
        headers=merchant_with_store["headers"],
    )

    assert res.status_code == 200, res.text
    body = res.json()
    assert "data" in body

    data = body["data"]
    assert data["order_id"] == order_id
    assert "status" in data
    assert "status_history" in data
    assert isinstance(data["status_history"], list)


async def test_simulate_status_change(client, merchant_with_store):
    payload = build_order_payload(merchant_with_store["store_id"])
    create_res = await client.post(
        "/api/orders",
        json=payload,
        headers=merchant_with_store["headers"],
    )
    assert create_res.status_code == 201, create_res.text

    order_id = create_res.json()["data"]["order_id"]

    assigned_res = await client.patch(
        f"/api/orders/{order_id}/status",
        json={"status": "assigned"},
        headers=merchant_with_store["headers"],
    )
    assert assigned_res.status_code == 200, assigned_res.text
    assigned_data = assigned_res.json()["data"]
    assert assigned_data["status"] == "assigned"

    picked_res = await client.patch(
        f"/api/orders/{order_id}/status",
        json={"status": "picked_up"},
        headers=merchant_with_store["headers"],
    )
    assert picked_res.status_code == 200, picked_res.text
    picked_data = picked_res.json()["data"]
    assert picked_data["status"] == "picked_up"


async def test_invalid_status_transition(client, merchant_with_store):
    payload = build_order_payload(merchant_with_store["store_id"])
    create_res = await client.post(
        "/api/orders",
        json=payload,
        headers=merchant_with_store["headers"],
    )
    assert create_res.status_code == 201, create_res.text

    order_id = create_res.json()["data"]["order_id"]

    res = await client.patch(
        f"/api/orders/{order_id}/status",
        json={"status": "delivered"},
        headers=merchant_with_store["headers"],
    )
    assert res.status_code == 400


async def test_merchant_isolation(client):
    auth_a = await register_and_login(client, email=unique_email("orders_a"))
    auth_b = await register_and_login(client, email=unique_email("orders_b"))

    store_res = await client.post(
        "/api/stores",
        json=build_store_payload("Isolation Store"),
        headers=auth_a["headers"],
    )
    assert store_res.status_code == 201, store_res.text
    store_id = store_res.json()["id"]

    order_res = await client.post(
        "/api/orders",
        json=build_order_payload(store_id),
        headers=auth_a["headers"],
    )
    assert order_res.status_code == 201, order_res.text
    order_id = order_res.json()["data"]["order_id"]

    res = await client.get(
        f"/api/orders/{order_id}",
        headers=auth_b["headers"],
    )
    assert res.status_code == 404