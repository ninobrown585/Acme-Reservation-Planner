const { client, 
    destroyReservation, 
    fetchReservations, 
    createReservation, 
    createTables, 
    createCustomer,
    fetchRestaurants,
    createRestaurant,
    fetchCustomers } = require('./db');
const express = require('express');
const app = express();

app.delete('/api/customers/:customer_id/reservations/:id',  async(req, res, next)=> {
    try {
        await destroyReservation({customer_id: req.params.customer_id, id: req.params.id});
        res.sendStatus(204);
    }
    catch(ex){
        next(ex);
    }
});

    app.get('/api/customer', async(req, res, next)=> {
        try {
          res.send(await fetchCustomers());
        }
        catch(ex){
          next(ex);
        }
      });
      
      app.get('/api/restaurants', async(req, res, next)=> {
        try {
          res.send(await fetchRestaurants());
        }
        catch(ex){
          next(ex);
        }
      });
      
      app.get('/api/reservations', async(req, res, next)=> {
        try {
          res.send(await fetchReservations());
        }
        catch(ex){
          next(ex);
        }
      });    

      app.post('/api/customers/:id/reservations',  async(req, res, next)=> {
        try {
            res.status(201).send(await createReservation({ customer_id: req.params.customer_id, restaurant_id: req.body.restaurant_id, reservation_date: req.body.reservation_date}));
        }
        catch(ex){
            next(ex);
        }
    });

    app.use((err, req, res, next)=> {
        res.status(err.status || 500).send({ error: err.message || err});
    });

    const init = async ()=> {
        console.log('connecting to database');
        await client.connect();
        console.log('connected to database');
        await createTables();
        console.log('created tables');
        const [mike, lang, andre, ariel, VeganVan, longBoards, nycSleet] = await Promise.all([
            createCustomer({ name: 'mike'}),
            createCustomer({ name: 'lang'}),
            createCustomer({ name: 'andre'}),
            createCustomer({ name: 'ariel'}),
            createRestaurant({ name: 'VeganVan'}),
            createRestaurant({ name: 'longBoards'}),
            createRestaurant({ name: 'nycSleet'}),
        ]);
        console.log(await fetchCustomers());
        console.log(await fetchRestaurants());
    
        const [ reservation, reservation2] = await Promise.all([
            createReservation({
            customer_id: ariel.id,
            restaurant_id: nycSleet.id,
            party_count: '5',
            reservation_date: '02/27/2024'
            }),
            createReservation({
                customer_id: ariel.id,
                restaurant_id: nycSleet.id,
                party_count: '7',
                reservation_date: '03/27/2024'
            }),
        ]);
        console.log(await fetchReservations());
        await destroyReservation({ id: reservation.id, customer_id: reservation.customer_id});
        console.log(await fetchReservations());

    const port = process.env.PORT || 3000;
    app.listen(port, ()=> {
        console.log(`listening on port ${port}`);
    //     console.log('some curl commands to test');
    //     console.log(`curl localhost:${port}/api/users`);
    //     console.log(`curl localhost:${port}/api/places`);
    //    console.log(`curl localhost:${port}/api/vacations`);
     });

};

init();