import React, { useState } from "react";

const PublicSubmissions = () => {
    const [form, setForm] = useState({
        name: "",
        mobile_number: "",
        email: "",
        address: "",
        birth_marks: "",
        image: null,
    });

    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        setForm({ ...form, image: file });
        if (file) {
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData();
            Object.entries(form).forEach(([key, value]) => {
                formData.append(key, value);
            });

            // Example POST request to backend
            const res = await fetch("http://localhost:8000/publicsubmission", {
                method: "POST",
                body: formData,
            });

            if (res.ok) {
                setSuccess(true);
                setForm({
                    name: "",
                    mobile_number: "",
                    email: "",
                    address: "",
                    birth_marks: "",
                    image: null,
                });
                setPreview(null);
            }
        } catch (error) {
            console.error("Error submitting:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <h2 className="text-3xl font-semibold text-center text-blue-600 dark:text-blue-100 mb-2">
                 Public Submission Form
            </h2>
            <p className="dark:text-gray-200 text-pink-600 text-center text-lg mb-10">
            Spotted someone who might need help? Share it here.
            </p>
           

            <form
                onSubmit={handleSubmit}
                className="grid md:grid-cols-2 gap-28 items-start"
            >
                {/* Left: Image upload */}
                {/* Image upload box */}
                <div className="relative flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center transition hover:border-blue-400 hover:bg-blue-50/40 shadow-sm">
                    <label
                        htmlFor="image"
                        className="cursor-pointer flex flex-col items-center justify-center gap-3"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-12 h-12 text-gray-400 group-hover:text-blue-500 transition"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 10.5L12 6l4.5 4.5M12 6v12"
                            />
                        </svg>
                        <p className="text-sm text-gray-600">
                            <span className="font-medium text-blue-600 hover:underline">
                                Click to upload
                            </span>{" "}
                            or drag and drop
                        </p>
                        <p className="text-xs text-gray-400">PNG, JPG up to 10MB</p>
                    </label>

                    <input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                    />

                    {preview && (
                        <div className="mt-4 w-full flex justify-center">
                            <img
                                src={preview}
                                alt="Preview"
                                className="w-48 h-48 object-cover rounded-lg border border-gray-200 shadow-md"
                            />
                        </div>
                    )}
                </div>

                {/* Right: Details form */}
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-600">
                            Your Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-300"
                            required
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-600">
                            Your Mobile Number
                        </label>
                        <input
                            type="text"
                            name="mobile_number"
                            value={form.mobile_number}
                            onChange={handleChange}
                            className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-300"
                            required
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-600">
                            Your Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-300"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-600">
                            Address / Location Last Seen
                        </label>
                        <input
                            type="text"
                            name="address"
                            value={form.address}
                            onChange={handleChange}
                            placeholder="location you last saw the victim ..."
                            className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-300"
                            required
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-600">
                            Birth Marks / Identification
                        </label>
                        <input
                            type="text"
                        
                            name="birth_marks"
                            value={form.birth_marks}
                            onChange={handleChange}
                            placeholder="any identifiable marks ... "
                            className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-300"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-200"
                    >
                        {loading ? "Submitting..." : "Submit"}
                    </button>

                    {success && (
                        <p className="text-green-600 text-center mt-3">
                            ✅ Successfully Submitted!
                        </p>
                    )}
                </div>
            </form>
        </div>
    );
};

export default PublicSubmissions;
