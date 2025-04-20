import * as Yup from "yup";

export const tableSchema = Yup.object().shape({
  name: Yup.string()
    .required("Table name is required")
    .min(3, "Must be at least 3 characters")
    .max(50, "Name must not exceed 50 characters"),
  type: Yup.string()
    .required("Table type is required"),
  seats: Yup.number()
    .required("Seats is required")
    .positive("Seats must be a positive number")
    .min(1, "Seats must be at least 1")
    .integer("Seats must be an integer")
    .max(30, "Seats must be no more than 30"),
  Description: Yup.string()
    .max(200, "Max 200 characters"),
}); 