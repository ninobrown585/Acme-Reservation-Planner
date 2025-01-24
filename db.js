const pg = require('pg');
const uuid = require('uuid');
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://postgres:nino@localhost:5432/acme_reservation');

const createTables = async ()=> {
    const SQL = `
        DROP TABLE IF EXISTS customer CASCADE;
        DROP TABLE IF EXISTS restaurant CASCADE;
        DROP TABLE IF EXISTS reservation CASCADE;
        CREATE TABLE customer(
            id UUID PRIMARY KEY,
            name VARCHAR(50) NOT NULL UNIQUE
        );
        CREATE TABLE restaurant(
            id UUID PRIMARY KEY,
            name VARCHAR(50) NOT NULL UNIQUE
        );
        CREATE TABLE reservation(
            id UUID PRIMARY KEY,
            reservation_date DATE NOT NULL,
            party_count INTEGER NOT NULL,
            customer_id UUID REFERENCES customer(id) NOT NULL,
            restaurant_id UUID REFERENCES restaurant(id) NOT NULL
        );
    `;
    
    await client.query(SQL);
};

const createCustomer = async (name)=> {
    const SQL = `
      INSERT INTO customer(id, name) VALUES ($1, $2) RETURNING *
    `;
    const response = await client.query(SQL, [uuid.v4(), name]);
    console.log(response);
    return response.rows[0];
  };
  
const createRestaurant = async (name)=> {
    const SQL = `
      INSERT INTO restaurant(id, name) VALUES($1, $2) RETURNING *
    `;
    const response = await client.query(SQL, [uuid.v4(), name]);
    return response.rows[0];
  }  

  
const fetchCustomers = async ()=> {
    const SQL = `
  SELECT *
  FROM customer
    `;
    const response = await client.query(SQL);
    return response.rows;
  }
  
const fetchRestaurants = async ()=> {
    const SQL = `
  SELECT *
  FROM restaurant
    `;
    const response = await client.query(SQL);
    return response.rows;
  } 

const createReservation = async ({ customer_id, restaurant_id, party_count, reservation_date})=> {
    const SQL = `
      INSERT INTO reservation(id, customer_id, restaurant_id, party_count, reservation_date) VALUES($1, $2, $3, $4, $5) RETURNING *
    `;
    const response = await client.query(SQL, [uuid.v4(), customer_id, restaurant_id, party_count, reservation_date]);
    return response.rows[0];
  }
  
const fetchReservations = async ()=> {
    const SQL = `
  SELECT *
  FROM reservation
    `;
    const response = await client.query(SQL);
    return response.rows;
  }

const destroyReservation = async ({ id, customer_id}) => {
    console.log(id, customer_id)
    const SQL = `
        DELETE FROM reservation
        WHERE id = $1 AND customer_id=$2
    `;
    await client.query(SQL, [id, customer_id]);
}; 

module.exports = {
  client, 
  destroyReservation, 
  fetchReservations, 
  createReservation, 
  createTables, 
  createCustomer,
  fetchRestaurants,
  createRestaurant,
  fetchCustomers
}; 