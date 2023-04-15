import { openAiClient } from "../openAiClient.js";

const CODE_WRITING_PROMPT = `
Your responsibility is to write code. 

Write code for described use case and return the results. Do not write explanations. 
`;

export async function writeCode(description) {
  const completion = await openAiClient.createChatCompletion({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: CODE_WRITING_PROMPT,
      },
      {
        role: "user",
        content: description,
      },
    ],
    temperature: 0.1,
  });
  const response = completion.data.choices[0];
  return response.message.content;
}
