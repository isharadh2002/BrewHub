const express = require('express')
const app = express();
const router = express.Router();

require('dotenv').config();
const PORT = process.env.PORT || 3001

app.listen(PORT, ()=>{console.log(`Server is running. Listening on http://localhost:${PORT}`)});


app.get('/', (req, res)=>{
    res.send("Hello there.....")
});
