export function extractCodeFromText(inputText) {
  const questionRegex = /Question:\s*(.*)/;
  const thoughtRegex = /Thought:\s*(.*)/;
  const actionRegex = /Action:\s*(.*)/;
  const inputRegex = /Action Input:\s*([\s\S]*)$/;

  const questionMatch = inputText.match(questionRegex);
  const thoughtMatch = inputText.match(thoughtRegex);
  const actionMatch = inputText.match(actionRegex);
  const inputMatch = inputText.match(inputRegex);

  if (actionMatch && inputMatch) {
    const action = actionMatch[1];
    const input = inputMatch[1];
    return { questionMatch, thoughtMatch, action, input };
  } else {
    console.error("No action or input found");
  }
}
