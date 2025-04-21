import * as Yup from "yup";

// Regex loại emoji
const emojiRegex =
  /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;

function parseTimeToMinutes(timeStr) {
  const [hour, minute] = timeStr.split(":").map(Number);
  return hour * 60 + minute;
}

function isSamePeriod(startMin, endMin) {
  // Buổi sáng: 5h -> 12h
  // Buổi chiều/tối: 12h -> 23h59 hoặc 0h -> 5h sáng hôm sau
  const isMorning = (time) => time >= 0 && time < 720; // 05:00 - 11:59
  const isAfternoon = (time) => time >= 720 && time < 1440; // 12:00 - 23:59

  if (
    (isMorning(startMin) && isMorning(endMin)) ||
    (isAfternoon(startMin) && isAfternoon(endMin))
  ) {
    return true;
  }
  return false;
}

export const restaurantSchema = Yup.object().shape({
  name: Yup.string()
    .required("Restaurant name is required.")
    .max(50, "Name must not exceed 50 characters.")
    .test(
      "no-emoji",
      "Name must not contain emojis.",
      (value) => !emojiRegex.test(value || "")
    ),

  started: Yup.string()
    .required("Opened time is required.")
    .test(
      "valid-time-range",
      "Opened time must be before closed time.",
      function (value) {
        const { ended } = this.parent;
        if (!value || !ended) return true;

        const startMin = parseTimeToMinutes(value);
        const endMin = parseTimeToMinutes(ended);

        if (isSamePeriod(startMin, endMin)) {
          return startMin < endMin;
        }

        return true; // nếu khác buổi thì cho phép
      }
    ),

  ended: Yup.string().required("Closed time is required."),

  location: Yup.string()
    .required("Location is required.")
    .test(
      "no-emoji",
      "Location must not contain emojis.",
      (value) => !emojiRegex.test(value || "")
    ),
});

export const restaurantEditSchema = Yup.object().shape({
  Name: Yup.string()
    .required("Restaurant name is required.")
    .max(50, "Name must not exceed 50 characters.")
    .test(
      "no-emoji",
      "Name must not contain emojis.",
      (value) => !emojiRegex.test(value || "")
    ),

  Started: Yup.string()
    .required("Opened time is required.")
    .test(
      "valid-time-range",
      "Opened time must be before closed time.",
      function (value) {
        const { ended } = this.parent;
        if (!value || !ended) return true;

        const startMin = parseTimeToMinutes(value);
        const endMin = parseTimeToMinutes(ended);

        if (isSamePeriod(startMin, endMin)) {
          return startMin < endMin;
        }

        return true; // nếu khác buổi thì cho phép
      }
    ),

  Ended: Yup.string().required("Closed time is required."),

  Location: Yup.string()
    .required("Location is required.")
    .test(
      "no-emoji",
      "Location must not contain emojis.",
      (value) => !emojiRegex.test(value || "")
    ),
});
