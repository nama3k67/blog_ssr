export const vi = {
	navbar: {
		home: "Trang chủ",
		projects: "Dự án",
		blogs: "Bài viết",
		about: "Giới thiệu",
	},
	userMenu: {
		userInfo: "Thông tin người dùng",
		blogCreate: "Tạo bài viết mới",
		login: "Đăng nhập",
		logout: "Đăng xuất",
	},
	i18n: {
		vi: "Tiếng Việt",
		en: "Tiếng Anh",
	},
	theme: {
		switchToDark: "Chuyển sang chế độ tối",
		switchToLight: "Chuyển sang chế độ sáng",
		light: "Sáng",
		dark: "Tối",
	},
	pages: {
		home: {
			title: "Trang chủ - Blog về Dinh dưỡng, Luyện tập & Công nghệ",
			description:
				"Một vận động viên chạy đường dài say mê chia sẻ kiến thức về dinh dưỡng, phương pháp luyện tập và công nghệ.",
			heading: "Trang chủ",
			signedIn: "Bạn đã đăng nhập",
			signedOut: "Bạn chưa đăng nhập",
		},
		about: {
			title:
				"Giới thiệu - Vận động viên chạy đường dài & Người đam mê Công nghệ",
			description:
				"Tìm hiểu về hành trình của tôi với tư cách là một vận động viên chạy đường dài và niềm đam mê với dinh dưỡng, luyện tập và công nghệ.",
			heading: "Giới thiệu",
		},
		projects: {
			title: "Dự án - Danh mục & Mẫu công việc",
			description:
				"Khám phá các dự án và danh mục của tôi, giới thiệu công việc của tôi trong lĩnh vực công nghệ và phát triển web.",
			heading: "Dự án",
		},
		posts: {
			title: "Blog - Bài viết về Dinh dưỡng, Luyện tập & Công nghệ",
			description:
				"Đọc các bài viết về dinh dưỡng chạy bộ, phương pháp luyện tập và góc nhìn về công nghệ từ một vận động viên chạy đường dài đầy đam mê.",
			ogDescription:
				"Đọc các bài viết về dinh dưỡng chạy bộ, phương pháp luyện tập và góc nhìn về công nghệ.",
			heading: "Blog về thể thao, sức khỏe và công nghệ",
			intro:
				"Là một vận động viên chạy đường dài đầy đam mê, tôi muốn chia sẻ kiến thức của mình về dinh dưỡng, phương pháp luyện tập và công nghệ",
			noPostsFound: "Không tìm thấy bài viết nào.",
		},
	},
	common: {
		readMore: "Đọc thêm",
		loading: "Đang tải...",
		error: "Đã xảy ra lỗi",
		login: "Đăng nhập",
		newPost: "Bài viết mới",
		previous: "Trước",
		next: "Tiếp",
		cancel: "Hủy",
		save: "Lưu",
		delete: "Xóa",
		edit: "Sửa",
		submit: "Gửi",
		approve: "Phê duyệt",
		reject: "Từ chối",
	},
	editor: {
		title: "Tiêu đề",
		titlePlaceholder: "Nhập tiêu đề bài viết...",
		slug: "Slug (URL)",
		slugPlaceholder: "tu-dong-tao-tu-tieu-de",
		description: "Mô tả",
		descriptionPlaceholder: "Tóm tắt ngắn về bài viết...",
		content: "Nội dung",
		contentPlaceholder: "Viết bài viết bằng Markdown...",
		language: "Ngôn ngữ",
		saveDraft: "Lưu nháp",
		publish: "Xuất bản",
		saving: "Đang lưu...",
		publishing: "Đang xuất bản...",
		draftSaved: "Đã lưu bản nháp thành công!",
		published: "Bài viết đã được xuất bản thành công!",
		errorSaving: "Không thể lưu bài viết. Vui lòng thử lại.",
		slugTaken: "Slug này đã được sử dụng cho ngôn ngữ này.",
		titleRequired: "Tiêu đề là bắt buộc.",
		contentRequired: "Nội dung là bắt buộc.",
		preview: "Xem trước",
		write: "Viết",
		uploading: "Đang tải lên...",
		uploadFailed: "Không thể tải ảnh lên. Vui lòng thử lại.",
		uploadImage: "Tải ảnh lên",
		dragDropOrPaste: "Kéo thả, dán hoặc nhấn để tải ảnh lên",
		maxFileSize: "Kích thước tối đa: 5MB",
		fileTooLarge: "Tệp quá lớn. Kích thước tối đa là 5MB.",
	},
};
export type ViDict = typeof vi;
