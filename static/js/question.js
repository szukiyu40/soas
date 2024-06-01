const snowflake = require('snowflake-sdk');

// Snowflake接続の設定
var connection = snowflake.createConnection({
    account: 'RT78841',
    username: 'szukiyu',
    password: '09058469162Ys!',
    warehouse: 'MY_WAREHOUSE',
    database: 'MY_DATABASE',
});

// Snowflakeに接続
connection.connect(function(err, conn) {
    if (err) {
        console.error('接続できませんでした:', err);
        return;
    }
    console.log('接続成功:', conn.getId());
});
