// app.js
const express = require('express');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const cookieParser = require('cookie-parser');
const { checkAuth,requireAuth } = require('./middleware/authMiddleware');
const itemRoutes = require('./routes/itemRoutes');
const lostItemsController = require('./controllers/lostItemsController');
const myListsController = require('./controllers/myListsController');
const app = express();

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Use authentication middleware
app.use(checkAuth);

// Routes
app.use('/auth', authRoutes);
app.use('/items', itemRoutes);

app.get('/', (req, res) => {
    res.render('index');
});
 
app.post('/submit-answer', lostItemsController.submitAnswer);

app.get('/home', (req, res) => {
    res.render('home');
});

app.get('/lost-items',requireAuth,lostItemsController.getFilteredLostItems);

app.get('/found-items',requireAuth,lostItemsController.getFilteredfoundItems);

app.get('/post-item',requireAuth, (req, res) => {
    res.render('post-item');
});

app.get('/mylists', requireAuth, myListsController.getMyLists);

app.post('/claim-lost-item/:id', myListsController.ClaimLostItem);
app.post('/delete-lost-item/:id', myListsController.DeleteLostItem);   


app.post('/claim-found-item/:id', myListsController.ClaimFoundItem);
app.post('/delete-found-item/:id', myListsController.DeleteFoundItem);



app.get('/about', (req, res) => {
    res.render('about');
});

app.get('/contact', (req, res) => {
    res.render('contact');
});

app.get('/find-item',requireAuth, (req, res) => {
    res.render('find-item');
});

app.get('auth/login', (req, res) => {
    res.render('login');
});

app.get('auth/register', (req, res) => {
    res.render('register');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
