export const formatChrono = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const formattedMinutes = ("0" + minutes).slice(-2);
  const remainingSeconds = Math.floor(seconds % 60);
  const formattedSeconds = ("0" + remainingSeconds).slice(-2);
  let formattedTime = "";
  if (hours > 0) {
    formattedTime = hours + ":" + formattedMinutes + ":" + formattedSeconds;
  } else if (minutes > 0) {
    formattedTime += minutes + ":" + formattedSeconds;
  } else {
    formattedTime += seconds;
  }
  return formattedTime;
};
export const formatFirstName = (userName) => {
  const [lastName, firstName = lastName] = userName
    .split(",")
    .map((name) => name.trim());
  return firstName;
};
