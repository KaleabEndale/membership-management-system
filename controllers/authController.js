const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const admins = require("../model/admindb");
const staffs = require("../model/staffdb");
const members = require("../model/memberdb");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { v4: uuidvv4 } = require("uuid");
const transporter = require("../config/mail");
const mds = require("../model/mddb");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const logs = require("../config/log");
require("dotenv").config();
const { validationResult } = require("express-validator");

exports.adminlogin = async (req, res) => {
  const errors = validationResult(req);
  const { username, password } = req.body;
  if (!errors.isEmpty()) {
    const isEmpty = errors.array().map((err) => err.msg);
    res.render("admin", { username: username, password: password, e: isEmpty });
  } else {
    const admin = await admins.findOne({ where: { username: username } });
    if (!admin) {
      res.render("admin", {
        username: username,
        password: password,
        e: "wrong password or username",
      });
    } else {
      const p = await bcrypt.compare(password, admin.password);
      if (p) {
        const token = jwt.sign({ id: admin.id }, process.env.ACCESS_TOKEN);
        res.cookie("token", token, {
          httpOnly: true,
          secure: true,
        });
        res.render("aprofile", { an: username });
      } else {
        res.render("admin", {
          username: username,
          password: password,
          e: "wrong password or username",
        });
      }
    }
  }
};

exports.adminforgotpassword = async (req, res) => {
  const errors = validationResult(req);
  const email = req.body.email;
  if (!errors.isEmpty()) {
    const isEmpty = errors.array().map((err) => err.msg);
    res.render("afp", { email: email, ade: isEmpty });
  } else {
    const admin = await admins.findOne({ where: { email: email } });
    if (!admin) {
      res.render("afp", { email: email, ade: "account doesnot exist " });
    } else {
      const passSent = crypto.randomBytes(5).toString("hex");
      const sent = await transporter.sendMail({
        from: "mms",
        to: email,
        subject: "reset password",
        text: `use this ${passSent} to reset your password . it will expire after 30 minute`,
      });
      const token = jwt.sign(
        { email: email, passSent: passSent },
        process.env.RESET_ACCESS_TOKEN
      );
      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        maxAge: 1800000,
      });
      res.render("apr");
    }
  }
};

exports.adminrecoverpassword = async (req, res) => {
  const errors = validationResult(req);
  const newpassword = req.body.newpassword;
  const sent = req.body.sent;
  const token = req.cookies.token;
  if (!errors.isEmpty()) {
    const isEmpty = errors.array().map((err) => err.msg);
    res.render("apr", { newpassword: newpassword, sent: sent, ade: isEmpty });
  } else {
    if (token) {
      const decode = jwt.verify(
        token,
        process.env.RESET_ACCESS_TOKEN,
        async (err, t) => {
          if (err) {
            res.render("afp", {
              email: t.email,
              ade: "account doesnot exist ",
            });
          } else {
            if (sent == t.passSent) {
              const hashedpass = await bcrypt.hash(newpassword, 10);
              admins.update(
                { password: hashedpass },
                { where: { email: t.email } }
              );
              res.render("admin");
            } else {
              res.render("apr", {
                newpassword: newpassword,
                sent: sent,
                ade: "wrong pass",
              });
            }
          }
        }
      );
    }
  }
};

exports.stafflogin = async (req, res) => {
  const errors = validationResult(req);
  const { username, password } = req.body;
  if (!errors.isEmpty()) {
    const isEmpty = errors.array().map((err) => err.msg);
    res.render("staff", { username: username, password: password, e: isEmpty });
  } else {
    const staff = await staffs.findOne({ where: { username: username } });
    if (!staff) {
      res.render("staff", {
        username: username,
        password: password,
        e: "wrong password or username",
      });
    } else {
      const p = await bcrypt.compare(password, staff.password);
      if (p) {
        const token = jwt.sign({ id: staff.id }, process.env.ACCESS_TOKEN);
        res.cookie("token", token, {
          httpOnly: true,
          secure: true,
        });
        res.render("sprofile", { sn: username });
      } else {
        res.render("staff", {
          username: username,
          password: password,
          e: "wrong password or username",
        });
      }
    }
  }
};

exports.staffforgotpassword = async (req, res) => {
  const errors = validationResult(req);
  const email = req.body.email;
  const staff = await staffs.findOne({ where: { email: email } });
  if (!errors.isEmpty()) {
    const isEmpty = errors.array().map((err) => err.msg);
    res.render("sfp", { email: email, ade: isEmpty });
  } else {
    if (!staff) {
      res.render("sfp", { email: email, ade: "account doesnot exist " });
    } else {
      const passSent = crypto.randomBytes(5).toString("hex");
      const sent = await transporter.sendMail({
        from: "mms",
        to: email,
        subject: "reset password",
        text: `use this ${passSent} to reset your password . it will expire after 30 minutes`,
      });
      const token = jwt.sign(
        { email: email, passSent: passSent },
        process.env.RESET_ACCESS_TOKEN
      );
      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        maxAge: 1800000,
      });
      res.render("spr");
    }
  }
};

exports.staffrecoverpassword = async (req, res) => {
  const errors = validationResult(req);
  const newpassword = req.body.newpassword;
  const sent = req.body.sent;
  const token = req.cookies.token;
  if (!errors.isEmpty()) {
    const isEmpty = errors.array().map((err) => err.msg);
    res.render("spr", { newpassword: newpassword, sent: sent, ade: isEmpty });
  } else {
    if (token) {
      const decode = jwt.verify(
        token,
        process.env.RESET_ACCESS_TOKEN,
        async (err, t) => {
          if (err) {
            res.render("sfp", {
              email: t.email,
              ade: "account doesnot exist ",
            });
          } else {
            if (sent == t.passSent) {
              const hashedpass = await bcrypt.hash(newpassword, 10);
              staffs.update(
                { password: hashedpass },
                { where: { email: t.email } }
              );
              res.render("staff");
            } else {
              res.render("spr", {
                newpassword: newpassword,
                sent: sent,
                ade: "wrong pass",
              });
            }
          }
        }
      );
    }
  }
};

exports.memberreg = async (req, res) => {
  const errors = validationResult(req);
  const { username, password, contact, email, address } = req.body;
  const id = uuidvv4();
  const hashedpass = await bcrypt.hash(password, 10);
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;
  if (!errors.isEmpty()) {
    const isEmpty = errors.array().map((err) => err.msg);
    res.render("mreg", {
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
        logs(username, "reg", "user registered successfully", ip);
        res.render("mlogin");
      })
      .catch((err) => {
        if (err.name === "SequelizeUniqueConstraintError") {
          res.render("mreg", {
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

exports.memberlogin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const isEmpty = errors.array().map((err) => err.msg);
    res.render("mlogin", {
      username: username,
      password: password,
      e: isEmpty,
    });
  } else {
    try {
      const { username, password } = req.body;
      const ip =
        req.headers["x-forwarded-for"]?.split(",")[0] ||
        req.socket.remoteAddress;
      const member = await members.findOne({ where: { username: username } });

      if (!member) {
        res.render("mlogin", {
          username: username,
          password: password,
          e: "wrong password or username",
        });
      } else {
        const p = await bcrypt.compare(password, member.password);
        if (p) {
          const token = jwt.sign({ id: member.id }, process.env.ACCESS_TOKEN);
          res.cookie("token", token, {
            httpOnly: true,
            secure: true,
          });
          const sub = await mds.findOne({ where: { id: member.id } });
          if (!sub) {
            logs(username, "login", "user logged in successfully", ip);
            return res.render("mprofile", {
              mn: member.username,
              me: member.email,
              mc: member.contact,
              ma: member.address,
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
                logs(username, "login", "user logged in successfully", ip);
                res.render("mprofile2", {
                  showButton: false,
                  si: sub.subid,
                  mn: member.username,
                  mc: member.contact,
                  me: member.email,
                  ma: member.address,
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
                const expdate = new Date(expiredate);
                const currentDate = new Date();

                const today = currentDate.setHours(0, 0, 0, 0);
                const difftime = expiredate - today;
                const diffdays = difftime / (1000 * 60 * 60 * 24);

                if (diffdays === 3) {
                  const sent = await transporter.sendMail({
                    from: "mms",
                    to: email,
                    subject: "subscription expiration reminder",
                    text: "Hello! Your subscription will expire in 3 days. Please renew it to continue enjoying our services.",
                  });
                }

                if (expdate < currentDate) {
                  logs(username, "login", "user logged in successfully", ip);
                  res.render("mprofile2", {
                    showButton: true,
                    msg: "subscription expired",
                    si: sub.subid,
                    mn: member.username,
                    mc: member.contact,
                    me: member.email,
                    ma: member.address,
                    mmt: name,
                    mms: status,
                    med: expiredate,
                    mod: outstandingdue,
                    mmc: currency,
                  });
                } else {
                  logs(username, "login", "user logged in successfully", ip);
                  res.render("mprofile2", {
                    showButton: true,
                    si: sub.subid,
                    mn: member.username,
                    mc: member.contact,
                    me: member.email,
                    ma: member.address,
                    mmt: name,
                    mms: status,
                    med: expiredate,
                    mod: outstandingdue,
                    mmc: currency,
                  });
                }
              }
            } else if (sub.how == "invoice") {
              const invoice = await stripe.invoices.retrieve(sub.subid);
              const name = invoice.lines.data[0].description;
              const currency = invoice.currency;
              logs(username, "login", "user logged in successfully", ip);
              res.render("mprofile2", {
                showButton: false,
                si: sub.subid,
                mn: member.username,
                mc: member.contact,
                me: member.email,
                ma: member.address,
                mmt: name,
                mms: "active",
                med: "never",
                mod: 0,
                mmc: currency,
              });
            }
          }
        } else {
          res.render("mlogin", {
            username: username,
            password: password,
            e: "wrong password or username",
          });
        }
      }
    } catch (error) {
      console.error(
        "Error fetching data from stripe , ERROR : ",
        error.message
      );
      res.status(500).send("Error fetching data from stripe");
    }
  }
};

exports.memberforgotpassword = async (req, res) => {
  const errors = validationResult(req);
  const email = req.body.email;
  if (!errors.isEmpty()) {
    const isEmpty = errors.array().map((err) => err.msg);
    res.render("mfp", { email: email, ade: isEmpty });
  } else {
    const member = await members.findOne({ where: { email: email } });
    if (!member) {
      res.render("mfp", { email: email, ade: "account doesnot exist " });
    } else {
      const passSent = crypto.randomBytes(5).toString("hex");
      const sent = await transporter.sendMail({
        from: "mms",
        to: email,
        subject: "reset password",
        text: `use this ${passSent} to reset your password . it will expire after 30 minutes`,
      });
      const token = jwt.sign(
        { email: email, passSent: passSent },
        process.env.RESET_ACCESS_TOKEN
      );
      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        maxAge: 1800000,
      });
      res.render("mpr");
    }
  }
};

exports.memberrecoverpassword = async (req, res) => {
  const errors = validationResult(req);
  const newpassword = req.body.newpassword;
  const sent = req.body.sent;
  const token = req.cookies.token;
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;
  if (!errors.isEmpty()) {
    const isEmpty = errors.array().map((err) => err.msg);
    res.render("mpr", { newpassword: newpassword, sent: sent, ade: isEmpty });
  } else {
    if (token) {
      const decode = jwt.verify(
        token,
        process.env.RESET_ACCESS_TOKEN,
        async (err, t) => {
          if (err) {
            res.render("mfp", {
              email: t.email,
              ade: "account doesnot exist ",
            });
          } else {
            if (sent == t.passSent) {
              const hashedpass = await bcrypt.hash(newpassword, 10);
              await members.update(
                { password: hashedpass },
                { where: { email: t.email } }
              );
              const m = await members.findOne({ where: { email: t.email } });
              logs(
                m.username,
                "recover",
                "user recovered password successfully",
                ip
              );
              res.render("mlogin");
            } else {
              res.render("mpr", {
                newpassword: newpassword,
                sent: sent,
                ade: "wrong pass",
              });
            }
          }
        }
      );
    }
  }
};
