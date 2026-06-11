const app = require("./app");

const PORT = process.env.PORT || 5000;

// start server
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});