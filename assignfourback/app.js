const express = require("express");
const https = require("https");
const bodyparser = require('body-parser');
const axios = require('axios');
const mongoose = require('mongoose');
const path = require('path');
const Album = require('./album.js')
const User = require('./user.js');

const app = express();
app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.static(__dirname));


mongoose.connect('mongodb+srv://oskosk:rgq900zhIfpuzXHb@clusterosk.gkcmuu4.mongodb.net/?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('Error connecting to MongoDB Atlas:', err));



app.get('/', function (req, res) {
    res.render(path.join(__dirname, 'signup.ejs'));

});


app.get('/mainpage', function (req, res) {
    res.render(path.join(__dirname, 'mainpage.ejs'));
});


app.get('/library', function (req, res) {
    Album.find({})
        .then(albums => {
            res.render(path.join(__dirname, 'library.ejs'), { albums: albums });
        })
        .catch(err => {
            console.error('Error fetching albums:', err);
            // Обработка ошибки, например, отправка сообщения об ошибке клиенту
            res.status(500).send('Error fetching albums');
        });
});


app.post("/register", async function (req, res) {
    
    const username = req.body.username;
    const password = req.body.password;

    // проверка, существует ли пользователь с таким именем
    const existingUser = await User.findOne({ username: username }).exec();
    if (existingUser) {
        return res.send('User with this username already exists');
    }

    // создание нового пользователя
    const newUser = new User({
        username: username,
        password: password
    });

    // сохранение пользователя в базе данных
    newUser.save()
        .then(savedUser => {
            // перенаправление обратно на страницу входа после успешной регистрации
            res.redirect('/');
        })
        .catch(err => {
            console.error('Error saving user to MongoDB:', err);
            res.send('Error saving user to MongoDB');
        });
});

app.post("/login", async function (req, res) {
    // получение данных из формы
    const username = req.body.username;
    const password = req.body.password;
     
 // проверка администраторских учетных данных
 if (username === 'aliaskar' && password === '25249') {
    // если учетные данные верны, перенаправляем на административную панель
    res.redirect('/adminpanel');
} else {
    // если учетные данные не администраторские, обрабатываем их как обычный вход
    const user = await User.findOne({ username: username, password: password }).exec();
    if (!user) {
        return res.send('Invalid username or password');
    }

    // перенаправление на страницу mainpage после успешного входа
    res.redirect('/mainpage');
}
});


// Обработчик POST-запроса для удаления альбома
// Обработчик POST-запроса для удаления альбома
app.post('/deleteAlbum', function (req, res) {
    const albumId = req.body.albumId;
    
    // Удаление альбома из базы данных по его идентификатору
    Album.findOneAndDelete({ _id: albumId })
        .then(deletedAlbum => {
            if (!deletedAlbum) {
                return res.status(404).send('Album not found');
            }
            console.log('Album deleted:', deletedAlbum);
            // Перенаправление пользователя обратно на страницу библиотеки или другое действие по вашему усмотрению
            res.redirect('/library');
        })
        .catch(err => {
            console.error('Error deleting album:', err);
            // Обработка ошибки, например, отправка сообщения об ошибке клиенту
            res.status(500).send('Error deleting album');
        });
});
// Обработчик POST-запроса для добавления альбома
app.post('/addAlbum', function (req, res) {
    const { name, artist, year, imageURL } = req.body;
    
    // Создание нового альбома с полученными данными
    const newAlbum = new Album({
        name: name,
        artist: artist,
        year: year,
        imageURL: imageURL
    });

    // Сохранение нового альбома в базе данных
    newAlbum.save()
        .then(album => {
            console.log('New album added:', album);
            // Перенаправление пользователя обратно на страницу библиотеки или другое действие по вашему усмотрению
            res.redirect('/library');
        })
        .catch(err => {
            console.error('Error adding new album:', err);
            // Обработка ошибки, например, отправка сообщения об ошибке клиенту
            res.status(500).send('Error adding new album');
        });
});

// GET-запрос для страницы редактирования альбома
app.get('/editAlbum', function (req, res) {
    const albumId = req.query.albumId; // Получение идентификатора альбома из запроса

    // Находим альбом по его идентификатору
    Album.findById(albumId)
        .then(album => {
            if (!album) {
                return res.status(404).send('Album not found');
            }
            // Отправляем страницу редактирования альбома, передавая данные альбома
            res.render(path.join(__dirname, 'editalbum.ejs'), { album: album });
        })
        .catch(err => {
            console.error('Error fetching album for editing:', err);
            // Обработка ошибки, например, отправка сообщения об ошибке клиенту
            res.status(500).send('Error fetching album for editing');
        });
});

// POST-запрос для обновления альбома
app.post('/updateAlbum', function (req, res) {
    const albumId = req.body.albumId;
    const { name, artist, year, imageURL } = req.body;
    
    // Находим альбом по его идентификатору и обновляем его данные
    Album.findByIdAndUpdate(albumId, { name, artist, year, imageURL }, { new: true })
        .then(updatedAlbum => {
            if (!updatedAlbum) {
                return res.status(404).send('Album not found');
            }
            console.log('Album updated:', updatedAlbum);
            // Перенаправление пользователя обратно на страницу библиотеки или другое действие по вашему усмотрению
            res.redirect('/library');
        })
        .catch(err => {
            console.error('Error updating album:', err);
            // Обработка ошибки, например, отправка сообщения об ошибке клиенту
            res.status(500).send('Error updating album');
        });
});






app.get('/adminpanel', async function (req, res) {
   
    const users = await User.find({}).exec();
    
    
    
    res.render(path.join(__dirname, 'adminpanel.ejs'), { users: users});
});

app.post("/admin/adduser", async function (req, res) {
    const { username, password } = req.body;
    
    const existingUser = await User.findOne({ username: username }).exec();
    if (existingUser) {
        return res.send('User with this username already exists');
    }

    const newUser = new User({
        username: username,
        password: password
    });

    // сохранить нового пользователя в базу данных
    newUser.save()
        .then(savedUser => {
            // перенаправить обратно на административную панель
            res.redirect('/adminpanel');
        })
        .catch(err => {
            console.error('Error saving user to MongoDB:', err);
            res.send('Error saving user to MongoDB');
        });
});

app.post("/admin/deleteuser", async function (req, res) {
    const userId = req.body.userId;
    
    await User.findByIdAndDelete(userId).exec();
    
    res.redirect('/adminpanel');
});

app.post("/admin/deleteuser/:userId", async function (req, res) {
    const userId = req.params.userId;
    try {
        await User.findByIdAndDelete(userId);
        res.redirect('/adminpanel');
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).send('Error deleting user');
    }
});


// Обработка поиска
app.post("/", async function (req, res) {
    const query = req.body.musictrack;
    const geniusApiKey = '8HGS9DRdBSAfEiRu7RzHDI8pGFMmS-1DazZt0UCaQmHMFpIdnXLLtW40oKXxhyAf';
    const geniusInfo = {}
    const wikiBaseUrl = 'https://en.wikipedia.org/api/rest_v1/page/summary/';

    try {
        // Получаем информацию от Genius Lyrics
        const geniusResponse = await axios.get(`https://api.genius.com/search?q=${query}`, {
            headers: {
                'Authorization': `Bearer ${geniusApiKey}`
            }
        });
         geniusInfo.onetrack = geniusResponse.data.response.hits[0].result;
         geniusInfo.twotrack = geniusResponse.data.response.hits[1].result;
         geniusInfo.threetrack = geniusResponse.data.response.hits[2].result;
         geniusInfo.fourtrack = geniusResponse.data.response.hits[3].result;
         geniusInfo.fivetrack = geniusResponse.data.response.hits[4].result;
         geniusInfo.sixtrack = geniusResponse.data.response.hits[5].result;
         geniusInfo.seventrack = geniusResponse.data.response.hits[6].result;

        

        let wikiInfo = null;
         try {
             const wikiResponse = await axios.get(`${wikiBaseUrl}${encodeURIComponent(query)}`);
             wikiInfo = wikiResponse.data.extract;
             res.render(__dirname +'/result.ejs', { geniusInfo: geniusInfo, wikiInfo: wikiInfo });
         } catch (wikiError) {
             console.error('Error getting Wikipedia info:', wikiError);
             
             res.render(__dirname +'/result.ejs', { geniusInfo: geniusInfo, wikiInfo: 'Not Found' });
         }
    } catch (error) {
        console.error('Error searching:', error);
        res.status(500).send('Error searching');
    }
});


const port = process.env.PORT || 3000; 

app.listen(port, function () {
    console.log(`Server started on ${port}`);
});