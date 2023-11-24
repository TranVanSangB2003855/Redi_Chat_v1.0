const config = require("../config/index");
const redi = require("../function/rediFunct");
const USER = require("../models/user.model");
const CHATROOM = require("../models/chatRoom.model");
const MESSAGE = require("../models/message.model");

var jwt = require("jsonwebtoken");

exports.signup = async (req, res) => {
  try {
    const checkPhone = await USER.findOne({ phone: req.body.phone });
    if (checkPhone) {
      res.status(400).send({ message: "Số điện thoại đã tồn tại !" });
    } else {
      const user = new USER({
        fullName: req.body.fullName,
        phone: req.body.phone,
        avatar: req.body.avatar,
        password: req.body.password,
        createAt: redi.getTime(),
        lastAccess: redi.getTime(),
        requestContact: [],
        contacts: []
      });
      await user.save();
      res.status(200).send({ message: "Đăng ký tài khoản mới thành công !!!" });
    }
  } catch (error) {
    console.error(error);
  }
};

exports.signin = async (req, res) => {
  try {
    const user = await USER.findOne({ phone: req.body.phone });
    console.log()
    if (user) {
      const passwordIsValid = req.body.password === user.password;
      if (passwordIsValid) {
        let chatRooms = await CHATROOM.find({ owner: user });
        let friends = await USER.find({ _id: user.contacts }, { password: 0, requestContact: 0, contacts: 0, createAt: 0, lastAccess: 0, __v: 0 });
        let requestContact = await USER.find({ _id: user.requestContact }, { password: 0, requestContact: 0, contacts: 0, createAt: 0, lastAccess: 0, __v: 0 });

        const token = jwt.sign({ id: user._id }, config.secret, {
          expiresIn: 86400, 
        });
        console.log(chatRooms)
        let roomInfo = [];

        for (let i = 0; i < chatRooms.length; i++) {
          let friend, lastMessage = null;
          for (let j = 0; j < chatRooms[i].owner.length; j++) {
            if (chatRooms[i].owner[j].toString() == user._id.toString()) {
              console.log("true", chatRooms[i].owner[j].toString(), user._id.toString(), redi.getTime());
            } else {
              friend = await USER.findById(chatRooms[i].owner[j]);
              lastMessage = await MESSAGE.findById(chatRooms[i].message[chatRooms[i].message.length - 1]);
              console.log("false", chatRooms[i].owner[j].toString(), user._id.toString(), redi.getTime(), friend)
              roomInfo.push(
                {
                  _id: chatRooms[i]._id,
                  owner: chatRooms[i].owner,
                  lastMessageDate: chatRooms[i].lastMessageDate,
                  lastMessage: lastMessage,
                  fullNameFriend: friend.fullName,
                  avatar: friend.avatar,
                  online: false
                }
              );
            };
          }
        }

        res.status(200).send({
          message: {
            '_id': user._id,
            'phone': user.phone,
            'fullName': user.fullName,
            'avatar': user.avatar,
            'requestContact': requestContact,
            'contacts': friends,
            'chatRooms': roomInfo,
            'token': token
          }
        });
      } else {
        res.status(400).send({ message: "Mật khẩu nhập không đúng !" });
      }

    } else {
      res.status(400).send({ message: "Số điện thoại không có sẵn !" });
    }
  } catch (error) {
    console.error(error);
  }
};

exports.signout = async (req, res) => {
  try {
    const user = await USER.findOneAndUpdate(
      { phone: req.body.phone },
      { $set: { lastAccess: redi.getTime() } },
      { new: true }
    );
    // console.log(req.body.phone)
    res.status(200).send({ message: "Đăng xuất thành công !" });
  } catch (error) {
    // console.error(error);
    res.status(500).send({ message: "lỗi đăng xuất !" });
  }
};