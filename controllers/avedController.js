const admins = require("../model/admindb");
const staffs = require("../model/staffdb");
const members = require("../model/memberdb");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { v4: uuidvv4 } = require("uuid");
const mds = require("../model/mddb");
const mis = require("../model/midb");
const { where } = require("sequelize");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const transporter = require("../config/mail");
const cashSubscription = require("../config/cashSubscription");
const cashPayment = require("../config/cashPayment");
require("dotenv").config();
const { validationResult } = require("express-validator");

exports.back = async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    res.render("mhome");
  } else {
    const decode = jwt.verify(
      token,
      process.env.ACCESS_TOKEN,
      async (err, aos) => {
        if (err) {
          res.render("mhome");
        } else {
          const s = await staffs.findOne({ where: { id: aos.id } });
          const a = await admins.findOne({ where: { id: aos.id } });
          if (s) {
            res.redirect("http://localhost:5000/staff");
          } else if (a) {
            res.redirect("http://localhost:5000/admin");
          } else {
            res.render("mhome");
          }
        }
      }
    );
  }
};

exports.addmember = async (req, res) => {
  const errors = validationResult(req);
  const { username, password, contact, email, address } = req.body;
  const id = uuidvv4();
  const hashedpass = await bcrypt.hash(password, 10);
  if (!errors.isEmpty()) {
    const isEmpty = errors.array().map((err) => err.msg);
    res.render("addmember", {
      er: isEmpty,
      username: username,
      password: password,
      contact: contact,
      email: email,
      address: address,
    });
  } else {
    members
      .sync()
      .then(() => {
        return members.create({
          id: id,
          username: username,
          password: hashedpass,
          contact: contact,
          email: email,
          address: address,
        });
      })
      .then((data) => {
        res.render("addmember", { ma: "member added successfully" });
      })
      .catch((err) => {
        if (err.name === "SequelizeUniqueConstraintError") {
          res.render("addmember", {
            er: "username already taken",
            username: username,
            password: password,
            contact: contact,
            email: email,
            address: address,
          });
        }
      });
  }
};

exports.viewmember = async (req, res) => {
  try {
    const username = req.body.username;
    const member = await members.findOne({ where: { username: username } });
    if (!member) {
      res.render("viewmember", {
        username: username,
        er: "member doesnot exist",
      });
    } else {
      //  res.render('viewmember',{username:username,id:member.id,username1:member.username,email:member.email,contact:member.contact,address:member.address})
      const m = await members.findOne({ where: { username: username } });
      if (!m) {
        return res.render("mlogin");
      } else {
        const sub = await mds.findOne({ where: { id: m.id } });
        if (!sub) {
          res.render("viewmember", {
            mi: m.id,
            mn: m.username,
            mc: m.contact,
            me: m.email,
            ma: m.address,
          });
        } else {
          if (sub.how == "session" || sub.how == "subscription") {
            if (sub.type == "lifetime") {
              const session = await stripe.checkout.sessions.retrieve(
                sub.subid,
                { expand: ["line_items"] }
              );
              const line_items = await stripe.checkout.sessions.listLineItems(
                sub.subid,
                { limit: 10 }
              );
              const paymentIntent = await stripe.paymentIntents.retrieve(
                session.payment_intent
              );

              const email = session.customer_email;
              const items = line_items.data.map((item) => ({
                name: item.description,
                amount: item.amount_total / 100,
                currency: item.currency,
              }));
              const name = items[0].name;
              const amount = items[0].amount;
              const currency = items[0].currency;
              const paymentTimestamp = new Date(paymentIntent.created * 1000);
              const paymentTIme = paymentTimestamp.toDateString();

              res.render("viewmember", {
                mi: m.id,
                mn: m.username,
                mc: m.contact,
                me: m.email,
                ma: m.address,
                mmt: name,
                mms: "active",
                med: "never",
                mod: 0,
                mmc: currency,
              });
            } else {
              const subscription = await stripe.subscriptions.retrieve(
                sub.subid
              );
              const invoice = await stripe.invoices.retrieve(
                subscription.latest_invoice
              );
              const price = subscription.items.data[0].price;
              const product = await stripe.products.retrieve(price.product);
              const invo = await stripe.invoices.list({
                subscription: sub.subid,
                status: "open",
                limit: 10,
              });

              const paymentTimestamp = new Date(
                invoice.status_transitions.paid_at * 1000
              );
              const paymentTIme = paymentTimestamp.toDateString();
              const status = subscription.status;
              const name = product.name;
              const amount = price.unit_amount / 100;
              const currency = price.currency;
              const email = invoice.customer_email;
              const interval = price.recurring.interval;
              let expiredate = new Date(paymentTIme);
              if (interval == "month") {
                expiredate.setMonth(expiredate.getMonth() + 1);
              } else if (interval == "year") {
                expiredate.setFullYear(expiredate.getFullYear() + 1);
              }
              let outstandingdue = 0;
              invo.data.forEach((inv) => {
                outstandingdue += inv.amount_due;
              });
              outstandingdue = outstandingdue / 100;

              res.render("viewmember", {
                mi: m.id,
                mn: m.username,
                mc: m.contact,
                me: m.email,
                ma: m.address,
                mmt: name,
                mms: status,
                med: expiredate,
                mod: outstandingdue,
                mmc: currency,
              });
            }
          } else {
            const invoice = await stripe.invoices.retrieve(sub.subid);
            const name = invoice.lines.data[0].description;
            const currency = invoice.currency;
            res.render("viewmember", {
              mi: m.id,
              mn: m.username,
              mc: m.contact,
              me: m.email,
              ma: m.address,
              mmt: name,
              mms: "active",
              med: "never",
              mod: 0,
              mmc: currency,
            });
          }
        }
      }
    }
  } catch (error) {
    console.error("Error fetching data from stripe , ERROR : ", error.message);
    res.status(500).send("Error fetching data from stripe");
  }
};

exports.findmember = async (req, res) => {
  const username = req.body.username;
  const member = await members.findOne({ where: { username: username } });
  if (!member) {
    res.render("findmember", {
      username: username,
      er: "member doesnot exist",
    });
  } else {
    res.render("editmember", {
      username: username,
      email: member.email,
      contact: member.contact,
      address: member.address,
    });
  }
};

exports.editmember = async (req, res) => {
  const { username, contact, email, address } = req.body;

  const m = await members.findOne({ where: { username: username } });
  const mt = await mds.findOne({ where: { id: m.id } });

  if (!mt || mt.type == "lifetime") {
    await members.update(
      { contact: contact, email: email, address: address },
      { where: { username: username } }
    );
    res.render("editmember", {
      username: username,
      email: email,
      contact: contact,
      address: address,
      mu: "member updated successfully",
    });
  } else {
    try {
      const sub = await stripe.subscriptions.retrieve(mt.subid);
      const cusid = sub.customer;
      await stripe.customers.update(cusid, {
        email: email,
      });
      await members.update(
        { contact: contact, email: email, address: address },
        { where: { username: username } }
      );
      res.render("editmember", {
        username: username,
        email: email,
        contact: contact,
        address: address,
        mu: "member updated successfully",
      });
    } catch (error) {
      console.error(
        "Error fetching data from stripe , ERROR : ",
        error.message
      );
      res.status(500).send("Error fetching data from stripe");
    }
  }
};

exports.deletemember = async (req, res) => {
  const errors = validationResult(req);
  const username = req.body.username;
  if (!errors.isEmpty()) {
    const isEmpty = errors.array().map((err) => err.msg);
    res.render("deletemember", { dm: isEmpty, username: username });
  } else {
    const m = await members.findOne({ where: { username: username } });
    const mt = await mds.findOne({ where: { id: m.id } });
    if (!mt || mt.type == "lifetime") {
      await mds.destroy({ where: { id: m.id } });
      await members.destroy({ where: { username: username } });
      res.render("deletemember", { dm: "member deleted successfully" });
    } else {
      const delsub = await stripe.subscriptions.cancel(mt.subid);
      await mds.destroy({ where: { id: m.id } });
      await members.destroy({ where: { username: username } });
      res.render("deletemember", { dm: "member deleted successfully" });
    }
  }
};

exports.cm = async (req, res) => {
  try {
    const username = req.body.username;
    const m = await members.findOne({ where: { username: username } });
    if (!m) {
      res.render("pfm", {
        username: username,
        showButton: false,
        er: "user doesnot exist",
      });
    } else {
      const md = await mds.findOne({ where: { id: m.id } });
      if (!md) {
        res.render("pfm", {
          username: username,
          email: m.email,
          showButton: true,
        });
      } else {
        res.render("pfm", {
          username: username,
          showButton: false,
          er: "user already paid",
        });
      }
    }
  } catch (error) {
    console.error("Error fetching data from stripe , ERROR : ", error.message);
    res.status(500).send("Error fetching data from stripe");
  }
};

exports.pay = async (req, res) => {
  try {
    const { username, type, currency } = req.body;
    const m = await members.findOne({ where: { username: username } });
    const id = m.id;
    const email = m.email;
    const mi = await mis.findOne({ where: { type: type } });
    const recurrence = mi.recurrence;
    let price = mi.price;
    if (currency == "etb") {
      price = (price * 132.13).toFixed(3);
    } else if (currency == "eur") {
      price = (price * 1.12).toFixed(3);
    }
    if (type == "lifetime") {
      cashPayment(req, res, id, username, email, type, price, currency);
    } else {
      cashSubscription(
        req,
        res,
        id,
        username,
        email,
        type,
        price,
        currency,
        recurrence
      );
    }
  } catch (error) {
    console.error("Error fetching data from stripe , ERROR : ", error.message);
    res.status(500).send("Error fetching data from stripe");
  }
};

exports.addstaff = async (req, res) => {
  const errors = validationResult(req);
  const { username, password, contact, email, address } = req.body;
  const id = uuidvv4();
  const hashedpass = await bcrypt.hash(password, 10);
  if (!errors.isEmpty()) {
    const isEmpty = errors.array().map((err) => err.msg);
    res.render("addmember", {
      er: isEmpty,
      username: username,
      password: password,
      contact: contact,
      email: email,
      address: address,
    });
  } else {
    staffs
      .sync()
      .then(() => {
        return staffs.create({
          id: id,
          username: username,
          password: hashedpass,
          contact: contact,
          email: email,
          address: address,
        });
      })
      .then((data) => {
        res.render("addstaff", { ma: "staff added successfully" });
      })
      .catch((err) => {
        if (err.name === "SequelizeUniqueConstraintError") {
          res.render("addstaff", {
            er: "username already taken",
            username: username,
            password: password,
            contact: contact,
            email: email,
            address: address,
          });
        }
      });
  }
};

exports.viewstaff = async (req, res) => {
  const username = req.body.username;
  const staff = await staffs.findOne({ where: { username: username } });
  if (!staff) {
    res.render("viewstaff", { username: username, er: "staff doesnot exist" });
  } else {
    res.render("viewstaff", {
      username: username,
      id: staff.id,
      username1: staff.username,
      email: staff.email,
      contact: staff.contact,
      address: staff.address,
    });
  }
};

exports.findstaff = async (req, res) => {
  const username = req.body.username;
  const staff = await staffs.findOne({ where: { username: username } });
  if (!staff) {
    res.render("findstaff", { username: username, er: "staff doesnot exist" });
  } else {
    res.render("editstaff", {
      username: username,
      email: staff.email,
      contact: staff.contact,
      address: staff.address,
    });
  }
};

exports.editstaff = async (req, res) => {
  const { username, contact, email, address } = req.body;

  await staffs.update(
    { contact: contact, email: email, address: address },
    { where: { username: username } }
  );
  res.render("editstaff", {
    username: username,
    email: email,
    contact: contact,
    address: address,
    mu: "staff updated successfully",
  });
};

exports.deletestaff = async (req, res) => {
  const errors = validationResult(req);
  const username = req.body.username;
  if (!errors.isEmpty()) {
    const isEmpty = errors.array().map((err) => err.msg);
    res.render("deletestaff", { dm: isEmpty, username: username });
  } else {
    await staffs.destroy({ where: { username: username } });
    res.render("deletestaff", { dm: "staff deleted successfully" });
  }
};
