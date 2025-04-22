// src/validations/registerSchema.js
import * as Yup from "yup";

const phoneRegex = /^(0[1-9][0-9]{8})$/;
const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&_])[A-Za-z\d@$!%*?&_]{8,}$/;
const nameRegex = /^[A-Za-zÀ-ỹ\s]+$/;
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const AccountSchema = Yup.object().shape({
    name: Yup.string()
        .required("Name is required.")
        .matches(nameRegex, {
            message: "Full name must contain only letters and spaces.",
            excludeEmptyString: true,
        })
        .max(50, "Name must not exceed 50 characters."),

    email: Yup.string()
        .transform(value => (value === '' ? undefined : value))
        .required("Email is required.")
        .matches(emailRegex, {
            message: "Gmail must be like abc@xyz.com form",
            excludeEmptyString: true,
        })
        .min(5, "The email must be at least 5 characters.")
        .max(50, "The email must not exceed 50 characters."),

    phone: Yup.string()
        .required("Phone number is required.")
        .matches(phoneRegex, {
            message: "Phone number must be exactly 10 digits.(e.g. 093*******).",
            excludeEmptyString: true,
        }),

    password: Yup.string()
        .required("Password is required.")
        .matches(
            passwordRegex,
            {
                message: "Password must include an uppercase letter, a lowercase letter, a number, and a special character (@$!%*?&_).",
                excludeEmptyString: true,
            }
        )
        .max(64, "The password must not exceed 64 characters."),

    confirmPassword: Yup.string()
        .transform(value => (value === '' ? undefined : value)) // Biến chuỗi rỗng thành undefined
        .required("Confirm password is required.")
        .oneOf([Yup.ref("newPassword")], "Passwords do not match."),

    role: Yup.string()
        .oneOf(["customer", "owner"], "Invalid role.")
});

export const loginSchema = Yup.object().shape({
    email: Yup.string()
        .required("Email is required.")
        .matches(emailRegex, {
            message: "Gmail must be like abc@xyz.com form",
            excludeEmptyString: true,
        })
        .min(5, "The email must be at least 5 characters.")
        .max(50, "The email must not exceed 50 characters."),

    password: Yup.string()
        .required("Password is required.")
        .matches(
            passwordRegex,
            {
                message: "Password must include an uppercase letter, a lowercase letter, a number, and a special character (@$!%*?&_).",
                excludeEmptyString: true,
            }
        )
        .max(64, "The password must not exceed 64 characters."),
});

export const changePasswordSchema = Yup.object().shape({
    oldPassword: Yup.string()
        .required("Old password is required.")
        .matches(passwordRegex, {
            message: "Password must include an uppercase letter, a lowercase letter, a number, and a special character (@$!%*?&_).",
            excludeEmptyString: true,
        }),

    newPassword: Yup.string()
        .transform(value => (value === '' ? undefined : value)) // Bắt lỗi required trước
        .required("New password is required.")
        .matches(passwordRegex, {
            message:
                "Password must include an uppercase letter, a lowercase letter, a number, and a special character (@$!%*?&_).",
            excludeEmptyString: true,
        })
        .max(64, "The password must not exceed 64 characters.")
        .when("oldPassword", (oldPassword, schema) => {
            return schema.test(
                "not-same-as-old",
                "New password should not be the same as the old password.",
                function (value) {
                    // chỉ kiểm tra nếu cả hai đều có giá trị
                    return !value || !oldPassword || value !== oldPassword;
                }
            );
        }),
    confirmPassword: Yup.string()
        .transform(value => (value === '' ? undefined : value)) // Biến chuỗi rỗng thành undefined
        .required("Confirm password is required.")
        .oneOf([Yup.ref("newPassword")], "Passwords do not match."),
});

export const resetPasswordSchema = Yup.object().shape({
    password: Yup.string()
        .required("New password is required.")
        .max(64, "The password must not exceed 64 characters.")
        .matches(
            passwordRegex,
            {
                message: "Password must include an uppercase letter, a lowercase letter, a number, and a special character (@$!%*?&_).",
                excludeEmptyString: true,
            }
        ),
    confirmPassword: Yup.string()
        .transform(value => (value === '' ? undefined : value)) // Biến chuỗi rỗng thành undefined
        .required("Confirm password is required.")
        .oneOf([Yup.ref("newPassword")], "Passwords do not match."),
});

export const profileSchema = Yup.object().shape({
    Name: Yup.string()
        .required("Name is required.")
        .matches(nameRegex, {
            message: "Full name must contain only letters and spaces.",
            excludeEmptyString: true,
        })
        .max(50, "The Name must not exceed 50 characters."),
    Phone: Yup.string()
        .required("Phone number is required.")
        .matches(phoneRegex, {
            message: "Phone number must be exactly 10 digits.(e.g. 093*******).",
            excludeEmptyString: true,
        }),
});

export const staffValidationSchema = Yup.object().shape({
    name: Yup.string()
        .required("Name is required.")
        .matches(nameRegex, {
            message: "Full name must contain only letters and spaces.",
            excludeEmptyString: true,
        })
        .max(50, "Name must not exceed 50 characters."),
    gmail: Yup
        .string()
        .matches(emailRegex, {
            message: "Gmail must be like abc@xyz.com form",
            excludeEmptyString: true,
        })
        .required("Gmail is required."),
    password: Yup
        .string()
        .required("Password is required.")
        .matches(
            passwordRegex,
            {
                message:
                    "Password must include an uppercase letter, a lowercase letter, a number, and a special character (@$!%*?&_).",
                excludeEmptyString: true,
            }
        )
        .max(64, "The password must not exceed 64 characters."),
    phone: Yup
        .string()
        .required("Phone number is required.")
        .matches(phoneRegex,{
            message: "Phone number must be exactly 10 digits.(e.g. 093*******).",
            excludeEmptyString: true,
        }),
});
