import pytest
from .conftest import register_and_login, unique_email

pytestmark = pytest.mark.asyncio


@pytest.fixture
async def merchant_auth(client):
    return await register_and_login(client, email=unique_email("stores_merchant"))


def build_store_payload(name="Test Store"):
    return {
        "name": name,
        "branch": "Main Branch",
        "address": "123 Test Road",
        "city": "Dhaka",
        "zone": "Dhanmondi",
        "phone": "01711111111",
        "email": f"{name.lower().replace(' ', '_')}@example.com",
    }


async def test_create_store(client, merchant_auth):
    payload = build_store_payload("Create Store")
    res = await client.post("/api/stores", json=payload, headers=merchant_auth["headers"])

    assert res.status_code == 201
    data = res.json()
    assert "id" in data
    assert data["name"] == payload["name"]


async def test_list_stores(client, merchant_auth):
    payload = build_store_payload("List Store")
    create_res = await client.post("/api/stores", json=payload, headers=merchant_auth["headers"])
    assert create_res.status_code == 201
    store_id = create_res.json()["id"]

    res = await client.get("/api/stores", headers=merchant_auth["headers"])
    assert res.status_code == 200

    data = res.json()
    assert isinstance(data, list)
    assert any(store["id"] == store_id for store in data)


async def test_update_store(client, merchant_auth):
    payload = build_store_payload("Old Store Name")
    create_res = await client.post("/api/stores", json=payload, headers=merchant_auth["headers"])
    assert create_res.status_code == 201
    store_id = create_res.json()["id"]

    update_payload = build_store_payload("Updated Store Name")

    res = await client.put(
        f"/api/stores/{store_id}",
        json=update_payload,
        headers=merchant_auth["headers"],
    )
    assert res.status_code == 200

    data = res.json()
    assert data["id"] == store_id
    assert data["name"] == "Updated Store Name"


async def test_deactivate_store(client, merchant_auth):
    payload = build_store_payload("Deactivate Store")
    create_res = await client.post("/api/stores", json=payload, headers=merchant_auth["headers"])
    assert create_res.status_code == 201
    store_id = create_res.json()["id"]

    delete_res = await client.delete(f"/api/stores/{store_id}", headers=merchant_auth["headers"])
    assert delete_res.status_code == 200
    assert delete_res.json()["message"] == "Store deactivated"

    detail_res = await client.get(f"/api/stores/{store_id}", headers=merchant_auth["headers"])
    assert detail_res.status_code == 200
    detail_data = detail_res.json()
    assert detail_data["id"] == store_id
    assert detail_data["is_active"] is False


async def test_store_merchant_isolation(client):
    auth_a = await register_and_login(client, email=unique_email("merchant_a"))
    auth_b = await register_and_login(client, email=unique_email("merchant_b"))

    create_res = await client.post(
        "/api/stores",
        json=build_store_payload("A Private Store"),
        headers=auth_a["headers"],
    )
    assert create_res.status_code == 201
    store_id = create_res.json()["id"]

    delete_res = await client.delete(
        f"/api/stores/{store_id}",
        headers=auth_b["headers"],
    )
    assert delete_res.status_code == 404