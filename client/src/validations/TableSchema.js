import * as Yup from "yup";
const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
const nameRegex = /^[a-zA-ZÀ-ỹ0-9 _-]+$/;
export const tableSchema = Yup.object().shape({
  name: Yup.string()
    .required("Table name is required")
    .min(3, "Must be at least 3 characters")
    .max(50, "Name must not exceed 50 characters")
    .matches(nameRegex, {
      message: "Invalid the name format",
      excludeEmptyString: true,
    })
    .test("no-emoji", "Name must not contain emojis.", value => !emojiRegex.test(value || "")),
  type: Yup.string()
    .required("Table type is required"),
  seats: Yup.number()
    .required("Seats is required")
    .positive("Seats must be a positive number")
    .min(1, "Seats must be at least 1")
    .integer("Seats must be an integer")
    .max(30, "Seats must be no more than 30"),
  description: Yup.string()
    .max(200, "Max 200 characters"),
}); 
