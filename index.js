const TelegramBot = require("node-telegram-bot-api");
const fs = require('fs');
const express = require("express");
const cors = require("cors");
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());
const PORT = process.env.PORT || 8000;

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });
const webAppUrl = "https://harmonious-khapse-11b1a2.netlify.app/";
const webAppWeatherUrl = "https://willowy-liger-db95b6.netlify.app/";
const webAppTodoUrl = "https://chimerical-capybara-706fa0.netlify.app/";
const webAppShoppingUrl = "https://delightful-faun-941e5c.netlify.app/";

const chatChannelId = process.env.CHAT_ID;

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  if (text === "/start") {
    await bot.sendMessage(chatId, "Ниже появятся кнопки с моими возможностями", {
      reply_markup: {
        keyboard: [
          // [{ text: "Заполнить форму", web_app: { url: webAppUrl + "form" } }],
          [{ text: "Узнать погоду", web_app: { url: webAppWeatherUrl } }],
          [
            {
              text: "Открыть приложение TODO",
              web_app: { url: webAppTodoUrl },
            },
          ],
          [{ text: "Сделать заказ в Софич38", web_app: { url: webAppShoppingUrl } }],
        ],
      },
    });
    await bot.sendMessage(
      chatId,
      "Заходи в наш интернет магазин по кнопке ниже",
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "Сделать заказ", web_app: { url: webAppUrl } }],
          ],
        },
      }
    );
  }

  if (msg?.web_app_data?.data) {
    try {
      const data = JSON.parse(msg?.web_app_data?.data);
      await bot.sendMessage(chatId, "Спасибо за заказ в Софич38! 🍆");

      await bot.sendMessage(
        chatId,
        `Вы приобрели товаров на сумму: ${
          data?.totalPrice.toFixed(2)
        }руб.💪\nСписок:\n${data?.products.map(
          (product) => `🔹 ${product.title} - ${product.quantity} шт.`
        ).join('\n')}
      `
      );
      await bot.sendMessage(
        chatChannelId,
        `Клиент ${msg.chat.first_name} ${msg.chat.last_name} только что приобрел товаров на сумму: ${
          data?.totalPrice.toFixed(2)
        }руб\nСписок:\n${data?.products.map(
          (product) => `- ${product.title} - ${product.quantity} шт.`
        ).join('\n')}
      `
      );
      // await bot.sendMessage(chatId, 'Ваша страна: ' + data?.country);
      // await bot.sendMessage(chatId, 'Ваша улица: ' + data?.street);

      setTimeout(async () => {
        await bot.sendMessage(chatId, "Всю информацию вы получите в этом чате. С любовью, ваш Шеф ❤️");
        await bot.sendPhoto(chatId, 'https://png.pngtree.com/element_our/png/20180918/chef-cooking-fried-chicken-and-delicious-sign-png_103460.jpg');
      }, 3000);
    } catch (e) {
      console.log(e);
    }
  }
});

app.post("/web-data", async (req, res) => {
  const { queryId, products, totalPrice } = req.body;
  try {
    await bot.answerWebAppQuery(queryId, {
      type: "article",
      id: queryId,
      title: "Успешная покупка",
      input_message_content: {
        message_text: `Поздравляю с успешной покупкой, вы приобрели товары на сумму ${totalPrice}`,
      },
    });
    return res.status(200).json({});
  } catch (e) {
    await bot.answerWebAppQuery(queryId, {
      type: "article",
      id: queryId,
      title: "Не удалось приобрести товар",
      input_message_content: { message_text: "Не удалось приобрести товар" },
    });
    return res.status(500).json({});
  }
});

app.post('/signup', async (req, res) => {
  const URL_API = `https://api.telegram.org/bot${ process.env.TELEGRAM_TOKEN }/sendMessage`;
  const {name, email, password} = req.body.data;
  let message = `<b>Заявка с сайта!</b>\n`;
  message += `<b>Отправитель: </b> ${name}\n`;
  message += `<b>Почта: </b> ${email}\n`;
  message += `<b>Пароль: </b> ${password}`;

  try {
    const response = await fetch(URL_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: chatChannelId,
        parse_mode: 'html',
        text: message,
      })
    })
    const data = await response.json();
  
    if (data.ok) {
      return res.status(200).json({message: 'Форма успешно отправлена!'});
    } else {
      return res.status(400).json({message: 'Что-то пошло не так'});
    }
  } catch (error) {
    return res.status(500).json({message: 'Возникла проблема с отправкой данных!'});
  }
});

app.post('/signup-tg', async (req, res) => {
  const {name, email, password} = req.body.data;
  let message = `<b>Заявка с сайта!</b>\n`;
  message += `<b>Отправитель: </b> ${name}\n`;
  message += `<b>Почта: </b> ${email}\n`;
  message += `<b>Пароль: </b> ${password}`;

  try {
    await bot.sendMessage(chatChannelId, message, {parse_mode: 'HTML'});
    return res.status(200).json({message: 'Форма успешно отправлена!'});
  } catch (error) {
    return res.status(500).json({message: 'Возникла проблема с отправкой данных!'});
  }
});

app.listen(PORT, () => `Server started on PORT: ${PORT}`);
