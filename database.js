const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: '54.162.124.191',
  user: 'user1',
  password: 'password',
  database: 'reviews_api'
});

connection.connect((err) => {
  if (err) {
    console.log(err);
  } else {
    console.log('Connected to MySQL!');
  }
});


const getReviews = (product_id, count) => {
  return new Promise((resolve, reject) => {
    const queryString = 'select * from photos as c right join (select * from reviews where product_id = ?) as e on c.review_id = e.review_id;';
    const queryArgs = [product_id];
    connection.query(queryString, queryArgs, (err, results, field) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

const addReview = ({product_id, rating, date, summary, body, recommend, name, email}) => {
  return new Promise((resolve, reject) => {
    const queryString = 'insert into reviews (product_id, rating, date, summary, body, recommend, reported, reviewer_name, reviewer_email, response, helpfulness) values ?';
    const queryArgs = [[product_id, rating, date, summary, body, recommend.toString(), 'false', name, email, null, 0]];
    connection.query(queryString, [queryArgs], (err, results, field) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

const getReviewPhotos = (review_ids) => {
  return new Promise((resolve, reject) => {
    let queryString = 'select * from photos where review_id in ?';
    const queryArgs = [review_ids];
    connection.query(queryString, [queryArgs], (err, results, field) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

const addPhotos = (review_id, photos) => {
  return new Promise((resolve, reject) => {
    const queryString = 'insert into photos (review_id, url) values ?';
    const queryArgs = [];
    for (let i = 0; i < photos.length; i++) {
      queryArgs.push([review_id, photos[i]]);
    }
    connection.query(queryString, [queryArgs], (err, results, field) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

const getMetaData = (product_id) => {
  return new Promise((resolve, reject) => {
    let queryString = 'select * from reviews inner join meta on meta.review_id = reviews.review_id and reviews.product_id = ?;'
    let queryArgs = [product_id];
    connection.query(queryString, queryArgs, (err, results, field) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

const addMetaData = ({characteristic_ids, review_id, values, product_id, characteristics}) => {
  return new Promise((resolve, reject) => {
    let queryString = 'insert into meta (characteristic_id, review_id, value, product_id, characteristic) values ?';
    let queryArgs = [];
    for (let i = 0; i < characteristic_ids.length; i++) {
      queryArgs.push([characteristic_ids[i], review_id, values[i], product_id, characteristics[i]]);
    }
    connection.query(queryString, [queryArgs], (err, results, field) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

const updateReview = (review_id) => {
  return new Promise((resolve, reject) => {
    let queryString = 'update reviews set helpfulness = helpfulness + 1 where review_id = ?';
    let queryArgs = [review_id];
    connection.query(queryString, queryArgs, (err, results, field) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

const updateReviewReport = (review_id) => {
  return new Promise((resolve, reject) => {
    let queryString = 'update reviews set reported = "true" where review_id = ?';
    let queryArgs = [review_id];
    connection.query(queryString, queryArgs, (err, results, field) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

const searchMetaData = (characteristics) => {
  return new Promise((resolve, reject) => {
    const queryString = 'select distinct characteristic_id, product_id, characteristic from meta where characteristic_id in (?)';
    const queryArgs = [];
    for (let key in characteristics) {
      queryArgs.push([key]);
    }
    console.log(queryArgs);
    connection.query(queryString, [queryArgs], (err, results, fields) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

module.exports = {
  getReviews: getReviews,
  getReviewPhotos: getReviewPhotos,
  getMetaData: getMetaData,
  addReview: addReview,
  addPhotos: addPhotos,
  addMetaData: addMetaData,
  searchMetaData: searchMetaData,
  updateReview: updateReview,
  updateReviewReport: updateReviewReport
}
