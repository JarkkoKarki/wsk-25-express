import express from 'express';
const hostname = '127.0.0.1';
const app = express();
const port = 3000;

app.use('/public', express.static('public'));

app.get('/', (req, res) => {
  res.send('Welcome to my REST API!');
});

app.get('/api/v1/cat', (req, res) => {
  const cat = {
    cat_id: 245,
    name: 'Kerttu-poika',
    birthdate: '2006-11-05',
    weight: 8,
    owner: 'Mike',
    image: 'https://loremflickr.com/320/240/cat',
  };

  res.json(cat);
});

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
