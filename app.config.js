import appJson from './app.json';

export default {
  ...appJson,
  expo: {
    ...appJson.expo,
    extra: {
      ...appJson.expo.extra,
      // API URLs - Đọc từ .env file hoặc dùng default
      apiGatewayUrl: process.env.EXPO_PUBLIC_API_GATEWAY_URL || "https://api.kooka.site/api",
      pythonCookService: process.env.EXPO_PUBLIC_PYTHON_COOK_SERVICE || "https://python-cook-service.onrender.com",
      recipeService: process.env.EXPO_PUBLIC_RECIPE_SERVICE || "https://recipe-service-l6yp.onrender.com",
      mealplanService: process.env.EXPO_PUBLIC_MEALPLAN_SERVICE || "https://mealplan-service.onrender.com",
      likeService: process.env.EXPO_PUBLIC_LIKE_SERVICE || "https://like-service-e07g.onrender.com",
      favoriteService: process.env.EXPO_PUBLIC_FAVORITE_SERVICE || "https://favorite-service-rpdt.onrender.com",
      reviewService: process.env.EXPO_PUBLIC_REVIEW_SERVICE || "https://review-service-j0g7.onrender.com",
      authService: process.env.EXPO_PUBLIC_AUTH_SERVICE || "https://auth-service-3jro.onrender.com",
      userService: process.env.EXPO_PUBLIC_USER_SERVICE || "https://user-service-zqa7.onrender.com",
      chatbotService: process.env.EXPO_PUBLIC_CHATBOT_SERVICE || "https://chatbot-service-8577.onrender.com",
    },
  },
};
