import http from 'http';
import express, { Express } from 'express';
import morgan from 'morgan';
import routes from './routes/move';

const router: Express = express();

router.use(morgan('dev'));
router.use(express.urlencoded({ extended: false }));
router.use(express.json());

router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'origin, X-Requested-With,Content-Type,Accept, Authorization'
  );
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET');
    return res.status(200).json({});
  }
  return next();
});

router.use('/', routes);

router.use((_req, res) => {
  return res
    .status(200)
    .json(
      'Use https://tic-tac-toe-mobly-test.herokuapp.com/move?board=<board_state> ' +
        'to get the next move for a board state. ' +
        "<board_state> is a string with length 9, with x's, o's and spaces"
    );
});

const httpServer = http.createServer(router);
const PORT: unknown = process.env.PORT ?? 6060;
httpServer.listen(PORT, () => console.log(`The server is running on port ${PORT}`));
