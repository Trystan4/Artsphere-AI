import {
  OPENAI_TEXT_URL,
  OPENAI_IMAGE_URL,
  OPENAI_TEXT_API_KEY,
  OPENAI_IMAGE_API_KEY,
} from "./module_env.js";
import { generatePromptPaint, saveImageToLocalStorage } from "./service.js";
import { types } from "./type.js";


document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("paint-btn").addEventListener("click", generatePaint);

  function generatePaint() {
    let img = document.getElementById("paint-img");
    if (!img.classList.contains("paint-img-hidden"))
      img.classList.add("paint-img-hidden");
    document.getElementById("paint-result").textContent = "";

    let divImg = document.getElementById("div-img");
    divImg.classList.add("loader");
   

    const prompt =
      "invent a short name for an impressionist art. The medium is acrylic paint, applied with a loose brush technique. We will use a Van Gogh-inspired color palette, with bright blues and greens ,using the style of Edouard Manet, known for his loose brushstrokes and emphasis on light and shadow. We will focus on capturing the essence of the scene rather than the details, giving the painting a dream-like quality. This style will complement the impressionist technique and the overall mood of the painting."
    const requestBodyText = {
      messages:[{
        role: "user",
        content: prompt
      }],
      temperature: 0.7,
      model: "gpt-3.5-turbo"
    };


    const imagerequestBody = {
      prompt: "",
      n: 1,
      size: "256x256",
    };

    fetch(OPENAI_TEXT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_TEXT_API_KEY}`,
      },
      body: JSON.stringify(requestBodyText),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        const paint = data.choices[0].message.content
        document.getElementById("paint-result").textContent = paint.replace(/"/g, "");
       
        imagerequestBody.prompt = generatePromptPaint(paint);
        return paint;
      })
      .then((paint) => {
        fetch(OPENAI_IMAGE_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_IMAGE_API_KEY}`,
          },
          body: JSON.stringify(imagerequestBody),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error("Network response was not ok");
            }
            return response.json();
          })
          .then((data) => {
            divImg.classList.remove("loader");
            img.classList.remove("paint-img-hidden");
            img.classList.add("paint-img-visible");
            document.getElementById("paint-img").src = data.data[0].url;
            saveImageToLocalStorage(document.getElementById("paint-result").textContent, data.data[0].url, types[2])
          });
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }
});
