export function extractCodeFromText(inputText) {
  const thoughtRegex = /Thought:\s*(.*)/;
  const actionRegex = /Action:\s*(.*)/;
  const inputRegex = /Action Input:\s*([\s\S]*)$/;

  const thoughtMatch = inputText.match(thoughtRegex);
  const actionMatch = inputText.match(actionRegex);
  const inputMatch = inputText.match(inputRegex);

  const action = actionMatch?.[1];
  const input = inputMatch?.[1];
  const thought = thoughtMatch?.[1];
  return { thought, action, input };
}
