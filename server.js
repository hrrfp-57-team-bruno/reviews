const express = require('express');
const cors = require('cors');
const db = require('./database.js');
const app = express();

app.use(express.json());
app.use(cors({
  origin: true
}));

app.get('/reviews', (req, res) => {
  let { product_id, count } = req.query;
  count ? count = Number(count) : count = 5;
  const obj = {};
  db.getReviews(product_id, count)
    .then((data) => {
      obj.product = data[0].product_id.toString();
      obj.page = 0;
      obj.count = count;
      obj.results = [];
      const check = {};

      for (let i = 0; i < data.length; i++) {
        data[i].recommend === 'true' ? data[i].recommend = true : data[i].recommend = false;
        data[i].reported === 'true' ? data[i].reported = true : data[i].reported = false;
        data[i].date = new Date(Number(data[i].date)).toISOString();

        if (check[data[i].review_id] === undefined) {
          data[i].photos = [];
          if (data[i].url) {
            data[i].photos.push({
              id: data[i].id,
              review_id: data[i].review_id,
              url: data[i].url
            });
          }
          check[data[i].review_id] = data[i];
        } else {
          if (data[i].url) {
            check[data[i].review_id].photos.push({
              id: data[i].id,
              review_id: data[i].review_id,
              url: data[i].url
            });
          }
        }
      }
      for (let key in check) {
        obj.results.push(check[key]);
      }
      res.send(obj);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get('/reviews/meta', (req, res) => {
  const { product_id } = req.query;
  const obj = {
    product_id: product_id,
    ratings: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0
    },
    recommended: {
      false: 0,
      true: 0
    },
    characteristics: {}
  }
  db.getMetaData(product_id)
    .then((data) => {
      const temp = {
        Fit: {
          id: null,
          total: 0,
          reviews: 0
        },
        Length: {
          id: null,
          total: 0,
          reviews: 0
         },
        Comfort: {
          id: null,
          total: 0,
          reviews: 0
         },
        Quality: {
          id: null,
          total: 0,
          reviews: 0
         }
      }
      for (let i = 0; i < data.length; i++) {
        temp[data[i].characteristic].id = data[i].characteristic_id;
        temp[data[i].characteristic].total += data[i].value;
        temp[data[i].characteristic].reviews++;
        obj.ratings[data[i].rating]++;
        if (data[i].recommend === 'true') {
          obj.recommended.true++;
        } else {
          obj.recommended.false++;
        }
      }
      for (let key in temp) {
        if (temp[key]['reviews'] !== 0) {
          obj.characteristics[key] = {};
          obj.characteristics[key].id = temp[key].id;
          obj.characteristics[key].value = temp[key]['total'] / temp[key]['reviews'];
        }
      }
      res.send(obj);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.post('/reviews', (req, res) => {
  let review_id;
  req.body.date = Math.round((new Date()).getTime())
  db.addReview(req.body)
    .then((data) => {
      review_id = data.insertId;
      if (req.body.photos.length > 0) {
        return db.addPhotos(review_id, req.body.photos);
      }
    })
    .then((data) => {
      return db.searchMetaData(req.body.characteristics);
    })
    .then((data) => {
      const obj = {
        characteristic_ids: [],
        values: [],
        characteristics: []
      };
      for (let i = 0; i < data.length; i++) {
        obj.characteristic_ids.push(data[i].characteristic_id);
        obj.values.push(req.body.characteristics[data[i].characteristic_id]);
        obj.characteristics.push(data[i].characteristic);
      }
      obj.review_id = review_id;
      obj.product_id = req.body.product_id;
      return db.addMetaData(obj);
    })
    .then((data) => {
      res.send();
    })
    .catch((err) => {
      console.log(err);
    });
});

app.put('/reviews/:review_id/helpful', (req, res) => {
  const review_id = req.params.review_id;
  db.updateReview(review_id)
    .then((data) => {
      res.send();
    })
    .catch((err) => {
      console.log(err);
    });
});

app.put('/reviews/:review_id/report', (req, res) => {
  const review_id = req.params.review_id;
  db.updateReviewReport(review_id)
    .then((data) => {
      res.send();
    })
    .catch((err) => {
      console.log(err);
    });
});

const port = 3000;

app.listen(port, () => {
  console.log('Listening on http://localhost:' + port);
})