import jwt from 'jsonwebtoken';

const adminEmail = "admin@forever.com";
const adminPassword = "qwerty123";
const secret = "greatstack";

const token = jwt.sign(adminEmail + adminPassword, secret);

async function test() {
    try {
        const res = await fetch('http://localhost:4000/api/order/dashboard', {
            headers: {
                token: token
            }
        });
        const data = await res.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.error(e);
    }
}
test();
