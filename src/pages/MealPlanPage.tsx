import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Modal,
    TextInput,
    Image,
    Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
    fetchMealPlansByUser,
    createMealPlan,
    updateMealPlan,
    deleteMealPlan,
    type DayPlan,
    type Meal,
} from "../redux/slices/mealPlanSlice";
import { fetchRecipes } from "../redux/slices/recipeSlice";
import Toast from "react-native-toast-message";

type MealType = "morning" | "noon" | "evening";

// Interface for AI-generated meal plan (from chatbot)
interface MealPlanDay {
    morning?: {
        recipeId: string;
        recipeName: string;
        recipeImage?: string;
    };
    noon?: {
        recipeId: string;
        recipeName: string;
        recipeImage?: string;
    };
    evening?: {
        recipeId: string;
        recipeName: string;
        recipeImage?: string;
    };
}

interface AIGeneratedPlan {
    mealPlanType: string;
    duration: number;
    plans: MealPlanDay[]; // Backend returns plans array (7 days), without date
    totalRecipes: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function MealPlanPage() {
    const navigation = useNavigation();
    const route = useRoute();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const { mealPlans } = useAppSelector((state) => state.mealPlans);
    const { recipes } = useAppSelector((state) => state.recipes);

    const [currentPlanIndex, setCurrentPlanIndex] = useState(0);
    const [showDatePickerModal, setShowDatePickerModal] = useState(false);
    const [showRecipeSelector, setShowRecipeSelector] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<{
        date: string;
        mealType: MealType;
    } | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [editingPlans, setEditingPlans] = useState<DayPlan[]>([]);
    const [selectedStartDate, setSelectedStartDate] = useState<Date>(new Date());
    const [viewMode, setViewMode] = useState<"browse" | "viewing" | "creating">(
        "browse"
    );
    const [hasChanges, setHasChanges] = useState(false);
    const [originalPlans, setOriginalPlans] = useState<DayPlan[]>([]);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // Backup state before opening date picker modal
    const [backupViewMode, setBackupViewMode] = useState<"browse" | "viewing" | "creating">("browse");
    const [backupEditingPlans, setBackupEditingPlans] = useState<DayPlan[]>([]);
    const [backupHasChanges, setBackupHasChanges] = useState(false);

    // Show delete confirmation modal
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);

    // Flag để đánh dấu plan vừa tạo
    const [justCreatedPlanId, setJustCreatedPlanId] = useState<string | null>(null);

    // AI-generated meal plans (temporary storage from chatbot)
    const [aiGeneratedPlans, setAiGeneratedPlans] = useState<MealPlanDay[] | null>(null);

    // Tab state for switching between Planner and Shopping List
    const [activeTab, setActiveTab] = useState<'planner' | 'shopping'>('planner');

    // Checked ingredients for shopping list
    const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(new Set());

    // Load data - fetch recipes CHỈ KHI chưa có data
    useEffect(() => {
        if (recipes.length === 0) {
            console.log('🔄 MealPlanPage - Fetching recipes...');
            dispatch(fetchRecipes());
        }
        if (user?._id) {
            dispatch(fetchMealPlansByUser(user._id));
        }
    }, [dispatch, user, recipes.length]);

    // Handle AI-generated meal plan from chatbot
    useEffect(() => {
        const params = route.params as { aiGeneratedPlan?: AIGeneratedPlan } | undefined;
        
        if (params?.aiGeneratedPlan) {
            console.log('🤖 Received AI-generated meal plan:', params.aiGeneratedPlan);
            
            // Check if user is logged in
            if (!user?._id) {
                Toast.show({
                    type: 'error',
                    text1: '⚠️ Yêu cầu đăng nhập',
                    text2: 'Vui lòng đăng nhập để sử dụng tính năng này!',
                });
                // @ts-ignore
                navigation.navigate('Login');
                return;
            }

            // Check pending plans limit (max 3)
            const pendingPlans = mealPlans.filter(p => p.status === 'pending');
            if (pendingPlans.length >= 3) {
                Toast.show({
                    type: 'error',
                    text1: '⚠️ Giới hạn kế hoạch',
                    text2: 'Bạn đã có 3 kế hoạch chưa hoàn thành. Vui lòng hoàn thành hoặc xóa bớt trước khi tạo mới.',
                });
                
                // Clear navigation params
                // @ts-ignore
                navigation.setParams({ aiGeneratedPlan: undefined });
                return;
            }

            // Set view mode to creating
            setViewMode('creating');
            
            // Save AI-generated plans temporarily (without date)
            setAiGeneratedPlans(params.aiGeneratedPlan.plans);
            
            // Clear editingPlans (will be set after user selects start date)
            setEditingPlans([]);
            
            // Open start date modal for user to select start date
            setShowDatePickerModal(true);
            
            // Clear navigation params to prevent re-triggering
            // @ts-ignore
            navigation.setParams({ aiGeneratedPlan: undefined });
        }
    }, [route.params, user, mealPlans, navigation]);

    // Sorted meal plans
    const sortedMealPlans = [...mealPlans].sort((a, b) => {
        if (a.status === "pending" && b.status !== "pending") return -1;
        if (a.status !== "pending" && b.status === "pending") return 1;
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });

    // Current plan
    const currentPlan = sortedMealPlans[currentPlanIndex];

    // Initialize view mode - KHÔNG được ghi đè state khi đang viewing/creating
    useEffect(() => {
        // Nếu đang tạo mới hoặc vừa tạo xong, KHÔNG làm gì
        if (viewMode === "creating" || justCreatedPlanId) return;

        if (sortedMealPlans.length === 0) {
            // Không còn plans nào
            if (viewMode !== "browse") {
                setViewMode("browse");
                setCurrentPlanIndex(0);
                setEditingPlans([]);
                setOriginalPlans([]);
                setHasChanges(false);
            }
        } else if (viewMode === "browse") {
            // Chỉ auto-switch sang viewing khi đang ở browse mode
            setViewMode("viewing");
            setCurrentPlanIndex(0);
            const firstPlan = sortedMealPlans[0];
            const plans = firstPlan?.plans || [];
            setEditingPlans(plans);
            setOriginalPlans(JSON.parse(JSON.stringify(plans)));
            setHasChanges(false);
        } else if (viewMode === "viewing" && !currentPlan) {
            // Nếu đang viewing nhưng currentPlan không tồn tại, fallback về plan đầu tiên
            if (sortedMealPlans.length > 0) {
                setCurrentPlanIndex(0);
                const firstPlan = sortedMealPlans[0];
                const plans = firstPlan?.plans || [];
                setEditingPlans(plans);
                setOriginalPlans(JSON.parse(JSON.stringify(plans)));
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sortedMealPlans.length, justCreatedPlanId, viewMode]);    // Generate week dates
    const getWeekDates = (): Date[] => {
        if (viewMode === "creating" && selectedStartDate) {
            const dates = [];
            for (let i = 0; i < 7; i++) {
                const date = new Date(selectedStartDate);
                date.setDate(selectedStartDate.getDate() + i);
                dates.push(date);
            }
            return dates;
        } else if (viewMode === "viewing" && currentPlan) {
            const startDate = new Date(currentPlan.startDate);
            const dates = [];
            for (let i = 0; i < 7; i++) {
                const date = new Date(startDate);
                date.setDate(startDate.getDate() + i);
                dates.push(date);
            }
            return dates;
        }

        const today = new Date();
        const dates = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            dates.push(date);
        }
        return dates;
    };

    const weekDates = getWeekDates();

    // Format date to string
    const formatDate = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    // Get day plan
    const getDayPlan = (date: string): DayPlan => {
        const existing = editingPlans.find((plan) => {
            const planDate = new Date(plan.date);
            const year = planDate.getFullYear();
            const month = String(planDate.getMonth() + 1).padStart(2, "0");
            const day = String(planDate.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}` === date;
        });
        return (
            existing || {
                date,
                morning: {},
                noon: {},
                evening: {},
            }
        );
    };

    // Get recipe from meal
    const getRecipeFromMeal = (meal?: Meal) => {
        if (!meal?.recipeId) return null;
        return recipes.find((r) => r._id === meal.recipeId) || null;
    };

    // Check if start date conflicts with existing plans (±6 days)
    const isStartDateConflict = (
        newStartDate: Date
    ): { hasConflict: boolean; conflictMessage?: string } => {
        const normalizedNewDate = new Date(newStartDate);
        normalizedNewDate.setHours(0, 0, 0, 0);

        for (const existingPlan of sortedMealPlans) {
            const existingStart = new Date(existingPlan.startDate);
            existingStart.setHours(0, 0, 0, 0);

            const forbiddenStart = new Date(existingStart);
            forbiddenStart.setDate(existingStart.getDate() - 6);
            forbiddenStart.setHours(0, 0, 0, 0);

            const forbiddenEnd = new Date(existingStart);
            forbiddenEnd.setDate(existingStart.getDate() + 6);
            forbiddenEnd.setHours(0, 0, 0, 0);

            if (
                normalizedNewDate >= forbiddenStart &&
                normalizedNewDate <= forbiddenEnd
            ) {
                const formatDateVN = (date: Date) =>
                    `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
                        .toString()
                        .padStart(2, "0")}/${date.getFullYear()}`;

                const message = `Ngày bắt đầu (${formatDateVN(
                    normalizedNewDate
                )}) nằm trong vùng cấm (từ ${formatDateVN(
                    forbiddenStart
                )} đến ${formatDateVN(forbiddenEnd)}) của kế hoạch bắt đầu ${formatDateVN(
                    existingStart
                )}.`;

                return { hasConflict: true, conflictMessage: message };
            }
        }

        return { hasConflict: false };
    };

    // Check if date is disabled for selection
    const isDateDisabled = (date: Date | null): boolean => {
        if (!date) return true;

        const normalizedDate = new Date(date);
        normalizedDate.setHours(0, 0, 0, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (normalizedDate < tomorrow) return true;

        const conflictCheck = isStartDateConflict(normalizedDate);
        return conflictCheck.hasConflict;
    };

    // Count number of changes from original plan
    const countChanges = (): number => {
        let changes = 0;

        // Compare each day plan
        editingPlans.forEach((editPlan) => {
            const originalPlan = originalPlans.find((op) => op.date === editPlan.date);

            if (!originalPlan) {
                // New day added
                if (
                    editPlan.morning?.recipeId ||
                    editPlan.noon?.recipeId ||
                    editPlan.evening?.recipeId
                ) {
                    changes++;
                }
            } else {
                // Check each meal type
                if (editPlan.morning?.recipeId !== originalPlan.morning?.recipeId) {
                    changes++;
                }
                if (editPlan.noon?.recipeId !== originalPlan.noon?.recipeId) {
                    changes++;
                }
                if (editPlan.evening?.recipeId !== originalPlan.evening?.recipeId) {
                    changes++;
                }
            }
        });

        // Check for removed days
        originalPlans.forEach((originalPlan) => {
            const editPlan = editingPlans.find((ep) => ep.date === originalPlan.date);
            if (
                !editPlan &&
                (originalPlan.morning?.recipeId ||
                    originalPlan.noon?.recipeId ||
                    originalPlan.evening?.recipeId)
            ) {
                changes++;
            }
        });

        return changes;
    };

    const changeCount = countChanges();

    // Calendar helper - get days in month
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days: (Date | null)[] = [];

        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dayDate = new Date(year, month, day);
            dayDate.setHours(0, 0, 0, 0);
            days.push(dayDate);
        }

        return days;
    };

    const goToPreviousMonth = () => {
        setCurrentMonth(
            (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1)
        );
    };

    const goToNextMonth = () => {
        setCurrentMonth(
            (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1)
        );
    };

    // Meal types
    const mealTypes: {
        id: MealType;
        name: string;
        icon: keyof typeof Ionicons.glyphMap;
        color: string;
    }[] = [
            { id: "morning", name: "Sáng", icon: "sunny", color: "#FBBF24" },
            { id: "noon", name: "Trưa", icon: "partly-sunny", color: "#F97316" },
            { id: "evening", name: "Tối", icon: "moon", color: "#8B5CF6" },
        ];

    // Start creating new plan
    const startCreatingNewPlan = () => {
        if (!user) {
            Toast.show({
                type: "error",
                text1: "Thông báo",
                text2: "Vui lòng đăng nhập để sử dụng tính năng này!",
                position: "top",
                visibilityTime: 3000,
            });
            return;
        }

        const pendingPlans = sortedMealPlans.filter((p) => p.status === "pending");
        if (pendingPlans.length >= 3) {
            Toast.show({
                type: "error",
                text1: "Giới hạn kế hoạch",
                text2: "Bạn đã có 3 kế hoạch chưa hoàn thành. Vui lòng hoàn thành hoặc xóa bớt trước khi tạo mới.",
                position: "top",
                visibilityTime: 4000,
            });
            return;
        }

        // Reset về tab Planner trước khi tạo mới
        setActiveTab('planner');

        // Backup current state trước khi mở modal
        setBackupViewMode(viewMode);
        setBackupEditingPlans([...editingPlans]);
        setBackupHasChanges(hasChanges);

        // Set start date to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setSelectedStartDate(tomorrow);
        setCurrentMonth(tomorrow);

        // CHỈ mở modal, KHÔNG đổi viewMode
        setShowDatePickerModal(true);
    };

    // Add recipe to meal
    const addRecipeToMeal = (
        date: string,
        mealType: MealType,
        recipeId: string
    ) => {
        const recipe = recipes.find((r) => r._id === recipeId);
        if (!recipe) return;

        const meal: Meal = {
            recipeId: recipe._id,
            recipeName: recipe.name,
            recipeImage: recipe.image,
        };

        setEditingPlans((prev) => {
            const existing = prev.find((plan) => {
                const planDate = new Date(plan.date);
                const year = planDate.getFullYear();
                const month = String(planDate.getMonth() + 1).padStart(2, "0");
                const day = String(planDate.getDate()).padStart(2, "0");
                return `${year}-${month}-${day}` === date;
            });

            if (existing) {
                return prev.map((plan) => {
                    const planDate = new Date(plan.date);
                    const year = planDate.getFullYear();
                    const month = String(planDate.getMonth() + 1).padStart(2, "0");
                    const day = String(planDate.getDate()).padStart(2, "0");
                    return `${year}-${month}-${day}` === date
                        ? { ...plan, [mealType]: meal }
                        : plan;
                });
            } else {
                return [
                    ...prev,
                    {
                        date,
                        [mealType]: meal,
                    } as DayPlan,
                ];
            }
        });

        setShowRecipeSelector(false);
        setSelectedSlot(null);
        setHasChanges(true);

        // Show success toast
        Toast.show({
            type: "success",
            text1: "✅ Thành công",
            text2: `Đã thêm món "${recipe.name}" vào thực đơn!`,
            position: "top",
            visibilityTime: 2500,
        });
    };

    // Remove recipe from meal
    const removeRecipeFromMeal = (date: string, mealType: MealType) => {
        if (currentPlan?.status === "completed") {
            Toast.show({
                type: "error",
                text1: "Không thể chỉnh sửa",
                text2: "Không thể chỉnh sửa kế hoạch đã hoàn thành",
                position: "top",
                visibilityTime: 3000,
            });
            return;
        }

        // Get recipe name for notification
        const dayPlan = getDayPlan(date);
        const meal = dayPlan[mealType];
        const recipeName = meal?.recipeName || "món ăn";

        // Remove directly without confirmation
        setEditingPlans((prev) =>
            prev
                .map((plan) => {
                    const planDate = new Date(plan.date);
                    const year = planDate.getFullYear();
                    const month = String(planDate.getMonth() + 1).padStart(2, "0");
                    const day = String(planDate.getDate()).padStart(2, "0");
                    return `${year}-${month}-${day}` === date
                        ? { ...plan, [mealType]: {} }
                        : plan;
                })
                .filter(
                    (plan) =>
                        plan.morning?.recipeId ||
                        plan.noon?.recipeId ||
                        plan.evening?.recipeId
                )
        );
        setHasChanges(true);

        Toast.show({
            type: "success",
            text1: "✅ Đã xóa",
            text2: `Đã xóa "${recipeName}" khỏi thực đơn`,
            position: "top",
            visibilityTime: 2500,
        });
    };

    // Save meal plan
    const saveMealPlan = async () => {
        if (!user?._id) {
            Toast.show({
                type: "error",
                text1: "Thông báo",
                text2: "Vui lòng đăng nhập",
                position: "top",
                visibilityTime: 3000,
            });
            return;
        }

        const validPlans = editingPlans.filter(
            (plan) =>
                plan.morning?.recipeId || plan.noon?.recipeId || plan.evening?.recipeId
        );

        if (validPlans.length === 0) {
            Toast.show({
                type: "error",
                text1: "Thiếu món ăn",
                text2: "Vui lòng thêm ít nhất một món ăn",
                position: "top",
                visibilityTime: 3000,
            });
            return;
        }

        try {
            if (currentPlan && viewMode === "viewing") {
                await dispatch(
                    updateMealPlan({
                        id: currentPlan._id,
                        mealPlan: {
                            userId: user._id,
                            plans: validPlans,
                        },
                    })
                ).unwrap();
                setHasChanges(false);
                setOriginalPlans(JSON.parse(JSON.stringify(validPlans)));
                Toast.show({
                    type: "success",
                    text1: "✅ Thành công",
                    text2: "Đã cập nhật kế hoạch bữa ăn thành công!",
                    position: "top",
                    visibilityTime: 3000,
                });
            } else {
                const formattedStartDate = formatDate(selectedStartDate);

                const newPlan = await dispatch(
                    createMealPlan({
                        userId: user._id,
                        plans: validPlans,
                        startDate: formattedStartDate,
                    })
                ).unwrap();

                // Sau khi tạo thành công, NGAY LẬP TỨC set flag để ngăn useEffect ghi đè
                setJustCreatedPlanId(newPlan._id);

                // Set editingPlans từ newPlan.plans (có đầy đủ món ăn)
                setEditingPlans(newPlan.plans);
                setOriginalPlans(JSON.parse(JSON.stringify(newPlan.plans)));

                // Tính toán index mới bằng cách thêm newPlan vào mảng hiện tại
                // Sau đó sort lại để tìm đúng vị trí
                const allPlans = [...mealPlans, newPlan];
                const sortedAllPlans = allPlans.sort((a, b) => {
                    if (a.status === "pending" && b.status !== "pending") return -1;
                    if (a.status !== "pending" && b.status === "pending") return 1;
                    return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
                });

                const newPlanIndex = sortedAllPlans.findIndex(p => p._id === newPlan._id);

                // Set tất cả state cùng lúc
                setCurrentPlanIndex(newPlanIndex !== -1 ? newPlanIndex : 0);
                setViewMode("viewing");
                setShowDatePickerModal(false);
                setHasChanges(false);

                // Dùng setTimeout ngắn để clear flag sau khi React đã render xong
                setTimeout(() => {
                    setJustCreatedPlanId(null);
                }, 100);

                Toast.show({
                    type: "success",
                    text1: "✅ Thành công",
                    text2: "Đã tạo kế hoạch bữa ăn mới thành công!",
                    position: "top",
                    visibilityTime: 3000,
                });
            }
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : "Có lỗi xảy ra";
            Toast.show({
                type: "error",
                text1: "❌ Lỗi",
                text2: errorMessage,
                position: "top",
                visibilityTime: 4000,
            });
        }
    };

    // Delete plan - show modal confirmation
    const deletePlan = () => {
        if (!currentPlan) return;
        setShowDeleteConfirmModal(true);
    };

    // Confirm delete plan
    const confirmDeletePlan = async () => {
        if (!currentPlan) return;

        const deletedPlanId = currentPlan._id;
        setShowDeleteConfirmModal(false);

        try {
            await dispatch(deleteMealPlan(deletedPlanId)).unwrap();

            // Tính toán remainingPlans TRƯỚC khi Redux update
            const remainingPlans = sortedMealPlans.filter(p => p._id !== deletedPlanId);

            if (remainingPlans.length > 0) {
                // Còn plans khác, hiển thị plan đầu tiên
                const nextPlan = remainingPlans[0];

                setViewMode("viewing");
                setCurrentPlanIndex(0);
                setEditingPlans(nextPlan.plans);
                setOriginalPlans(JSON.parse(JSON.stringify(nextPlan.plans)));
                setHasChanges(false);
            } else {
                // Không còn plan nào, chuyển sang browse mode
                setViewMode("browse");
                setCurrentPlanIndex(0);
                setEditingPlans([]);
                setOriginalPlans([]);
                setHasChanges(false);
            }

            Toast.show({
                type: "success",
                text1: "✅ Thành công",
                text2: "Đã xóa kế hoạch bữa ăn!",
                position: "top",
                visibilityTime: 3000,
            });
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : "Có lỗi xảy ra";
            Toast.show({
                type: "error",
                text1: "❌ Lỗi",
                text2: errorMessage,
                position: "top",
                visibilityTime: 4000,
            });
        }
    };

    // Navigate plans
    const goToPreviousPlan = () => {
        if (currentPlanIndex > 0) {
            const newIndex = currentPlanIndex - 1;
            setCurrentPlanIndex(newIndex);
            const plans = sortedMealPlans[newIndex]?.plans || [];
            setEditingPlans(plans);
            setOriginalPlans(JSON.parse(JSON.stringify(plans)));
            setHasChanges(false);
        }
    };

    const goToNextPlan = () => {
        if (currentPlanIndex < sortedMealPlans.length - 1) {
            const newIndex = currentPlanIndex + 1;
            setCurrentPlanIndex(newIndex);
            const plans = sortedMealPlans[newIndex]?.plans || [];
            setEditingPlans(plans);
            setOriginalPlans(JSON.parse(JSON.stringify(plans)));
            setHasChanges(false);
        }
    };

    // Filtered recipes for selector
    const filteredRecipes = recipes.filter((recipe) =>
        recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Generate shopping list from meal plan
    const generateShoppingList = () => {
        const ingredientMap = new Map<string, { name: string; count: number }>();

        editingPlans.forEach((plan) => {
            [plan.morning, plan.noon, plan.evening].forEach((meal) => {
                if (meal?.recipeId) {
                    const recipe = recipes.find((r) => r._id === meal.recipeId);
                    if (recipe && recipe.ingredients) {
                        recipe.ingredients.forEach((ing) => {
                            const existing = ingredientMap.get(ing.name);
                            if (existing) {
                                existing.count++;
                            } else {
                                ingredientMap.set(ing.name, { name: ing.name, count: 1 });
                            }
                        });
                    }
                }
            });
        });

        return Array.from(ingredientMap.values());
    };

    // Toggle ingredient check
    const toggleIngredientCheck = (ingredientName: string) => {
        setCheckedIngredients((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(ingredientName)) {
                newSet.delete(ingredientName);
            } else {
                newSet.add(ingredientName);
            }
            return newSet;
        });
    };

    // Calculate stats
    const getStats = () => {
        let totalRecipes = 0;
        let totalTime = 0;

        editingPlans.forEach((plan) => {
            [plan.morning, plan.noon, plan.evening].forEach((meal) => {
                if (meal?.recipeId) {
                    const recipe = recipes.find((r) => r._id === meal.recipeId);
                    if (recipe) {
                        totalRecipes++;
                        totalTime += recipe.time || 0;
                    }
                }
            });
        });

        return { totalRecipes, totalTime };
    };

    const stats = getStats();

    if (!user) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50 px-6">
                <Ionicons name="calendar-outline" size={80} color="#D1D5DB" />
                <Text className="text-xl font-bold text-gray-900 mt-6 mb-2">
                    Lập kế hoạch bữa ăn
                </Text>
                <Text className="text-gray-600 text-center mb-6">
                    Vui lòng đăng nhập để sử dụng tính năng này
                </Text>
                <TouchableOpacity
                    onPress={() => navigation.navigate("Login" as never)}
                    className="bg-orange-500 px-8 py-3 rounded-xl"
                >
                    <Text className="text-white font-semibold text-base">Đăng nhập</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View className="bg-gradient-to-br from-green-50 to-blue-50 pt-12 pb-6 px-4">
                    <View className="flex-row items-center justify-between mb-4">
                        <View className="flex-row items-center">
                            <Ionicons name="calendar" size={32} color="#10B981" />
                            <Text className="text-2xl font-bold text-gray-900 ml-3">
                                Kế hoạch bữa ăn
                            </Text>
                        </View>
                        {viewMode !== "creating" && (
                            <TouchableOpacity
                                onPress={startCreatingNewPlan}
                                className="bg-orange-500 w-10 h-10 rounded-xl items-center justify-center"
                            >
                                <Ionicons name="add" size={24} color="#FFF" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Stats */}
                    <View className="flex-row gap-3 mt-4">
                        <View className="flex-1 bg-white rounded-xl p-4">
                            <Text className="text-gray-500 text-xs mb-1">Tổng món</Text>
                            <Text className="text-2xl font-bold text-orange-500">
                                {stats.totalRecipes}
                            </Text>
                        </View>
                        <View className="flex-1 bg-white rounded-xl p-4">
                            <Text className="text-gray-500 text-xs mb-1">Thời gian</Text>
                            <Text className="text-2xl font-bold text-green-500">
                                {stats.totalTime}p
                            </Text>
                        </View>
                    </View>

                    {/* Tab Switcher */}
                    {(viewMode === 'viewing' || viewMode === 'creating') && editingPlans.length > 0 && (
                        <View className="flex-row gap-2 mt-4">
                            <TouchableOpacity
                                onPress={() => setActiveTab('planner')}
                                className={`flex-1 py-3 rounded-xl flex-row items-center justify-center ${
                                    activeTab === 'planner' 
                                        ? 'bg-orange-500' 
                                        : 'bg-white border border-gray-200'
                                }`}
                            >
                                <Ionicons 
                                    name="calendar" 
                                    size={20} 
                                    color={activeTab === 'planner' ? '#FFF' : '#9CA3AF'} 
                                />
                                <Text className={`ml-2 font-semibold ${
                                    activeTab === 'planner' ? 'text-white' : 'text-gray-500'
                                }`}>
                                    Lập kế hoạch
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setActiveTab('shopping')}
                                className={`flex-1 py-3 rounded-xl flex-row items-center justify-center ${
                                    activeTab === 'shopping' 
                                        ? 'bg-orange-500' 
                                        : 'bg-white border border-gray-200'
                                }`}
                            >
                                <Ionicons 
                                    name="cart" 
                                    size={20} 
                                    color={activeTab === 'shopping' ? '#FFF' : '#9CA3AF'} 
                                />
                                <Text className={`ml-2 font-semibold ${
                                    activeTab === 'shopping' ? 'text-white' : 'text-gray-500'
                                }`}>
                                    Mua sắm
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Plan Navigation */}
                {viewMode === "viewing" && sortedMealPlans.length > 0 && currentPlan && (
                    <View className="bg-white px-4 py-3 border-b border-gray-200">
                        <View className="flex-row items-center justify-between">
                            <TouchableOpacity
                                onPress={goToPreviousPlan}
                                disabled={currentPlanIndex === 0}
                                className={currentPlanIndex === 0 ? "opacity-30" : ""}
                            >
                                <Ionicons name="chevron-back" size={24} color="#F97316" />
                            </TouchableOpacity>

                            <View className="flex-1 items-center">
                                <Text className="text-sm text-gray-500">
                                    Kế hoạch {currentPlanIndex + 1}/{sortedMealPlans.length}
                                </Text>
                                <Text className="text-base font-semibold text-gray-900">
                                    {new Date(currentPlan.startDate).toLocaleDateString("vi-VN")}
                                </Text>
                                <View
                                    className={`px-3 py-1 rounded-full mt-1 ${currentPlan.status === "pending"
                                        ? "bg-yellow-100"
                                        : "bg-green-100"
                                        }`}
                                >
                                    <Text
                                        className={`text-xs font-semibold ${currentPlan.status === "pending"
                                            ? "text-yellow-700"
                                            : "text-green-700"
                                            }`}
                                    >
                                        {currentPlan.status === "pending"
                                            ? "Đang thực hiện"
                                            : "Hoàn thành"}
                                    </Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={goToNextPlan}
                                disabled={currentPlanIndex === sortedMealPlans.length - 1}
                                className={
                                    currentPlanIndex === sortedMealPlans.length - 1
                                        ? "opacity-30"
                                        : ""
                                }
                            >
                                <Ionicons name="chevron-forward" size={24} color="#F97316" />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Shopping List Tab - Moved up here */}
                {activeTab === 'shopping' && (viewMode === "viewing" || viewMode === "creating") && (
                    <View className="px-4 mt-4">
                        <View className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            {/* Header */}
                            <View className="bg-gradient-to-r from-orange-500 to-red-500 px-4 py-4">
                                <View className="flex-row items-center justify-between">
                                    <View className="flex-row items-center">
                                        <Ionicons name="cart" size={24} color="#FFF" />
                                        <Text className="text-white text-lg font-bold ml-2">
                                            Danh sách mua sắm
                                        </Text>
                                    </View>
                                    <View className="bg-white/20 px-3 py-1 rounded-full">
                                        <Text className="text-white text-xs font-semibold">
                                            {generateShoppingList().length} nguyên liệu
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {/* Shopping List Content */}
                            <View className="p-4">
                                {generateShoppingList().length === 0 ? (
                                    <View className="items-center py-12">
                                        <Ionicons name="cart-outline" size={64} color="#D1D5DB" />
                                        <Text className="text-gray-500 mt-4 text-center">
                                            Chưa có nguyên liệu nào{'\n'}Hãy thêm món ăn vào kế hoạch!
                                        </Text>
                                    </View>
                                ) : (
                                    <View>
                                        {generateShoppingList().map((item, index) => (
                                            <TouchableOpacity
                                                key={item.name}
                                                onPress={() => toggleIngredientCheck(item.name)}
                                                className={`flex-row items-center py-3 ${
                                                    index !== generateShoppingList().length - 1
                                                        ? 'border-b border-gray-100'
                                                        : ''
                                                }`}
                                                activeOpacity={0.7}
                                            >
                                                {/* Checkbox */}
                                                <View
                                                    className={`w-6 h-6 rounded-md border-2 mr-3 items-center justify-center ${
                                                        checkedIngredients.has(item.name)
                                                            ? 'bg-orange-500 border-orange-500'
                                                            : 'border-gray-300 bg-white'
                                                    }`}
                                                >
                                                    {checkedIngredients.has(item.name) && (
                                                        <Ionicons name="checkmark" size={16} color="#FFF" />
                                                    )}
                                                </View>

                                                {/* Ingredient Info */}
                                                <View className="flex-1">
                                                    <Text
                                                        className={`text-base ${
                                                            checkedIngredients.has(item.name)
                                                                ? 'text-gray-400 line-through'
                                                                : 'text-gray-900 font-medium'
                                                        }`}
                                                    >
                                                        {item.name}
                                                    </Text>
                                                </View>

                                                {/* Count Badge */}
                                                <View className="bg-orange-100 px-2.5 py-1 rounded-full">
                                                    <Text className="text-orange-600 text-xs font-semibold">
                                                        {item.count}x
                                                    </Text>
                                                </View>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </View>

                            {/* Action Button */}
                            {generateShoppingList().length > 0 && (
                                <View className="px-4 pb-4">
                                    <TouchableOpacity
                                        onPress={() => {
                                            Toast.show({
                                                type: 'info',
                                                text1: '💡 Tính năng đang phát triển',
                                                text2: 'Xuất danh sách mua sắm sẽ sớm có trong phiên bản tiếp theo!',
                                                position: 'top',
                                                visibilityTime: 3000,
                                            });
                                        }}
                                        className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl py-3 flex-row items-center justify-center"
                                    >
                                        <Ionicons name="download-outline" size={20} color="#FFF" />
                                        <Text className="text-white font-bold text-base ml-2">
                                            Xuất danh sách
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>

                        {/* Tips Section */}
                        <View className="mt-4 bg-blue-50 rounded-xl p-4 border border-blue-100">
                            <View className="flex-row items-start">
                                <Ionicons name="bulb" size={20} color="#3B82F6" />
                                <View className="flex-1 ml-3">
                                    <Text className="text-blue-900 font-semibold text-sm mb-1">
                                        💡 Mẹo mua sắm
                                    </Text>
                                    <Text className="text-blue-700 text-xs leading-5">
                                        • Nhấn vào nguyên liệu để đánh dấu đã mua{'\n'}
                                        • Số lần xuất hiện cho biết cần dùng cho bao nhiêu món{'\n'}
                                        • Nên mua đủ số lượng theo kế hoạch để tránh lãng phí
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                )}

                {/* Empty State */}
                {viewMode === "browse" && sortedMealPlans.length === 0 && (
                    <View className="items-center justify-center py-20 px-6">
                        <Ionicons name="calendar-outline" size={80} color="#D1D5DB" />
                        <Text className="text-xl font-bold text-gray-900 mt-6 mb-2">
                            Chưa có kế hoạch nào
                        </Text>
                        <Text className="text-gray-600 text-center mb-6">
                            Tạo kế hoạch bữa ăn đầu tiên của bạn ngay hôm nay!
                        </Text>
                        <TouchableOpacity
                            onPress={startCreatingNewPlan}
                            className="bg-orange-500 px-8 py-3 rounded-xl flex-row items-center"
                        >
                            <Ionicons name="add-circle" size={20} color="#FFF" />
                            <Text className="text-white font-semibold text-base ml-2">
                                Tạo kế hoạch mới
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Planner Tab - Meal Plan Table */}
                {activeTab === 'planner' && (viewMode === "viewing" || viewMode === "creating") && (
                    <View className="mt-4">
                        <ScrollView
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            decelerationRate="fast"
                            snapToAlignment="start"
                        >
                            {weekDates.map((date, dateIndex) => {
                                const dateStr = formatDate(date);
                                const dayPlan = getDayPlan(dateStr);
                                const dayName = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"][
                                    date.getDay()
                                ];

                                return (
                                    <View
                                        key={dateIndex}
                                        className="px-4"
                                        style={{ width: SCREEN_WIDTH }}
                                    >
                                        <View className="bg-white rounded-2xl shadow-lg overflow-hidden">
                                            {/* Date Header */}
                                            <View className="bg-gradient-to-r from-orange-500 to-orange-600 p-4">
                                                <Text className="text-white font-bold text-lg text-center">
                                                    {dayName}, {date.getDate()}/{date.getMonth() + 1}
                                                </Text>
                                            </View>

                                            {/* Meals */}
                                            <ScrollView
                                                className="p-4"
                                                style={{ maxHeight: 550 }}
                                                showsVerticalScrollIndicator={false}
                                            >
                                                {mealTypes.map((mealType) => {
                                                    const meal = dayPlan[mealType.id];
                                                    const recipe = getRecipeFromMeal(meal);

                                                    return (
                                                        <View key={mealType.id} className="mb-4">
                                                            <View className="flex-row items-center mb-2">
                                                                <Ionicons
                                                                    name={mealType.icon}
                                                                    size={20}
                                                                    color={mealType.color}
                                                                />
                                                                <Text className="text-sm font-semibold text-gray-700 ml-2">
                                                                    {mealType.name}
                                                                </Text>
                                                            </View>

                                                            {recipe ? (
                                                                <TouchableOpacity
                                                                    onPress={() =>
                                                                        (navigation as any).navigate("RecipeDetail", { id: recipe._id })
                                                                    }
                                                                    className="bg-gray-50 rounded-xl p-3 flex-row items-center"
                                                                    style={{ height: 88 }}
                                                                >
                                                                    <Image
                                                                        source={{ uri: recipe.image }}
                                                                        className="w-16 h-16 rounded-lg"
                                                                        resizeMode="cover"
                                                                    />
                                                                    <View className="flex-1 ml-3">
                                                                        <Text
                                                                            className="text-sm font-semibold text-gray-900"
                                                                            numberOfLines={2}
                                                                        >
                                                                            {recipe.name}
                                                                        </Text>
                                                                        <Text className="text-xs text-gray-500 mt-1">
                                                                            {recipe.time} phút • {recipe.difficulty}
                                                                        </Text>
                                                                    </View>
                                                                    {currentPlan?.status !== "completed" && (
                                                                        <TouchableOpacity
                                                                            onPress={() =>
                                                                                removeRecipeFromMeal(dateStr, mealType.id)
                                                                            }
                                                                            className="p-2"
                                                                        >
                                                                            <Ionicons
                                                                                name="close-circle"
                                                                                size={24}
                                                                                color="#EF4444"
                                                                            />
                                                                        </TouchableOpacity>
                                                                    )}
                                                                </TouchableOpacity>
                                                            ) : (
                                                                <TouchableOpacity
                                                                    onPress={() => {
                                                                        if (currentPlan?.status === "completed") {
                                                                            Toast.show({
                                                                                type: "error",
                                                                                text1: "Không thể chỉnh sửa",
                                                                                text2: "Không thể chỉnh sửa kế hoạch đã hoàn thành",
                                                                                position: "top",
                                                                                visibilityTime: 3000,
                                                                            });
                                                                            return;
                                                                        }
                                                                        setSelectedSlot({
                                                                            date: dateStr,
                                                                            mealType: mealType.id,
                                                                        });
                                                                        setShowRecipeSelector(true);
                                                                    }}
                                                                    className="bg-gray-50 rounded-xl p-3 flex-row items-center border border-dashed border-gray-300"
                                                                    style={{ height: 88 }}
                                                                >
                                                                    <View className="w-16 h-16 rounded-lg bg-gray-100 items-center justify-center">
                                                                        <Ionicons
                                                                            name="add-circle-outline"
                                                                            size={28}
                                                                            color="#9CA3AF"
                                                                        />
                                                                    </View>
                                                                    <View className="flex-1 ml-3 justify-center">
                                                                        <Text className="text-sm font-semibold text-gray-600">
                                                                            Thêm món ăn
                                                                        </Text>
                                                                        <Text className="text-xs text-gray-400 mt-1" numberOfLines={1}>
                                                                            Nhấn để chọn món
                                                                        </Text>
                                                                    </View>
                                                                </TouchableOpacity>
                                                            )}
                                                        </View>
                                                    );
                                                })}
                                                <View className="h-4" />
                                            </ScrollView>
                                        </View>
                                    </View>
                                );
                            })}
                        </ScrollView>

                        {/* Swipe Indicator */}
                        <View className="flex-row justify-center items-center mt-4 mb-2">
                            <Ionicons name="chevron-back" size={20} color="#9CA3AF" />
                            <Text className="text-gray-500 text-sm mx-3 font-medium">
                                Vuốt để xem các ngày khác
                            </Text>
                            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                        </View>
                    </View>
                )}

                {/* Action Buttons */}
                {(viewMode === "viewing" || viewMode === "creating") && (
                    <View className="px-4 pb-8 mt-4">
                        {viewMode === "viewing" && hasChanges && activeTab === 'planner' && (
                            <TouchableOpacity
                                onPress={saveMealPlan}
                                className="bg-orange-500 rounded-xl py-4 items-center mb-3"
                            >
                                <Text className="text-white font-bold text-base">
                                    Lưu thay đổi {changeCount > 0 && `(${changeCount})`}
                                </Text>
                            </TouchableOpacity>
                        )}

                        {viewMode === "creating" && activeTab === 'planner' && (
                            <TouchableOpacity
                                onPress={saveMealPlan}
                                className="bg-orange-500 rounded-xl py-4 items-center mb-3"
                            >
                                <Text className="text-white font-bold text-base">
                                    Tạo kế hoạch
                                </Text>
                            </TouchableOpacity>
                        )}

                        {viewMode === "viewing" && currentPlan?.status === "pending" && activeTab === 'planner' && (
                            <TouchableOpacity
                                onPress={deletePlan}
                                className="bg-red-500 rounded-xl py-4 items-center mb-3"
                            >
                                <Text className="text-white font-bold text-base">
                                    Xóa kế hoạch
                                </Text>
                            </TouchableOpacity>
                        )}

                        {viewMode === "creating" && activeTab === 'planner' && (
                            <TouchableOpacity
                                onPress={() => {
                                    // Restore lại state như khi chưa nhấn "Tạo mới"
                                    setViewMode(backupViewMode);
                                    setEditingPlans(backupEditingPlans);
                                    setHasChanges(backupHasChanges);
                                    setSelectedStartDate(new Date());
                                }}
                                className="border-2 border-gray-300 rounded-xl py-4 items-center"
                            >
                                <Text className="text-gray-700 font-bold text-base">Hủy</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                <View className="h-24" />
            </ScrollView>

            {/* Date Picker Modal */}
            <Modal
                visible={showDatePickerModal}
                animationType="slide"
                transparent
                onRequestClose={() => setShowDatePickerModal(false)}
            >
                <View className="flex-1 bg-black/50 justify-center items-center p-4">
                    <View className="bg-white rounded-3xl w-full max-w-md overflow-hidden">
                        {/* Header */}
                        <View className="bg-gradient-to-r from-orange-500 to-orange-600 p-6">
                            <View className="flex-row items-center justify-between mb-2">
                                <Text className="text-white text-xl font-bold">
                                    📅 Chọn Ngày Bắt Đầu
                                </Text>
                                <TouchableOpacity
                                    onPress={() => {
                                        setShowDatePickerModal(false);
                                        setCurrentMonth(new Date());
                                    }}
                                    className="p-1"
                                >
                                    <Ionicons name="close" size={24} color="#FFF" />
                                </TouchableOpacity>
                            </View>
                            <Text className="text-white/90 text-sm">
                                Kế hoạch sẽ bắt đầu từ ngày này và kéo dài 7 ngày
                            </Text>
                        </View>

                        {/* Calendar */}
                        <View className="p-6">
                            {/* Month Navigation */}
                            <View className="flex-row items-center justify-between mb-6">
                                <TouchableOpacity
                                    onPress={goToPreviousMonth}
                                    className="p-2 hover:bg-gray-100 rounded-lg"
                                >
                                    <Ionicons name="chevron-back" size={20} color="#4B5563" />
                                </TouchableOpacity>
                                <Text className="text-lg font-bold text-gray-900">
                                    {currentMonth.toLocaleDateString("vi-VN", {
                                        month: "long",
                                        year: "numeric",
                                    })}
                                </Text>
                                <TouchableOpacity
                                    onPress={goToNextMonth}
                                    className="p-2 hover:bg-gray-100 rounded-lg"
                                >
                                    <Ionicons name="chevron-forward" size={20} color="#4B5563" />
                                </TouchableOpacity>
                            </View>

                            {/* Weekday Headers */}
                            <View className="flex-row mb-2">
                                {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((day) => (
                                    <View key={day} className="flex-1 items-center py-2">
                                        <Text className="text-xs font-semibold text-gray-500">
                                            {day}
                                        </Text>
                                    </View>
                                ))}
                            </View>

                            {/* Calendar Grid */}
                            <ScrollView
                                style={{ maxHeight: 300 }}
                                showsVerticalScrollIndicator={false}
                            >
                                <View className="flex-row flex-wrap">
                                    {getDaysInMonth(currentMonth).map((date, index) => {
                                        if (!date) {
                                            return (
                                                <View
                                                    key={`empty-${index}`}
                                                    style={{ width: `${100 / 7}%` }}
                                                    className="aspect-square"
                                                />
                                            );
                                        }

                                        const disabled = isDateDisabled(date);
                                        const isSelected =
                                            selectedStartDate?.toDateString() === date.toDateString();
                                        const isToday =
                                            new Date().toDateString() === date.toDateString();
                                        const conflictCheck = isStartDateConflict(date);
                                        const isConflict = conflictCheck.hasConflict;

                                        return (
                                            <TouchableOpacity
                                                key={date.toISOString()}
                                                onPress={() => {
                                                    if (!disabled) {
                                                        setSelectedStartDate(date);
                                                    } else if (isConflict) {
                                                        Toast.show({
                                                            type: "error",
                                                            text1: "❌ Ngày không hợp lệ",
                                                            text2: conflictCheck.conflictMessage || "Ngày này xung đột với kế hoạch hiện có",
                                                            position: "top",
                                                            visibilityTime: 4000,
                                                        });
                                                    }
                                                }}
                                                disabled={disabled}
                                                style={{ width: `${100 / 7}%` }}
                                                className={`aspect-square p-1 ${isSelected
                                                    ? "bg-orange-500 rounded-lg"
                                                    : disabled && isConflict
                                                        ? "bg-red-50 rounded-lg"
                                                        : disabled
                                                            ? "bg-gray-50 rounded-lg"
                                                            : isToday
                                                                ? "bg-yellow-100 rounded-lg"
                                                                : ""
                                                    }`}
                                            >
                                                <View className="flex-1 items-center justify-center">
                                                    <Text
                                                        className={`text-sm font-medium ${isSelected
                                                            ? "text-white"
                                                            : disabled && isConflict
                                                                ? "text-red-300 line-through"
                                                                : disabled
                                                                    ? "text-gray-300"
                                                                    : isToday
                                                                        ? "text-yellow-700"
                                                                        : "text-gray-700"
                                                            }`}
                                                    >
                                                        {date.getDate()}
                                                    </Text>
                                                </View>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </ScrollView>

                            {/* Selected Date Display */}
                            {selectedStartDate && !isDateDisabled(selectedStartDate) && (
                                <View className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border-2 border-orange-200">
                                    <View className="flex-row items-center justify-between">
                                        <View className="flex-1">
                                            <Text className="text-xs text-gray-600 mb-1">
                                                Ngày được chọn:
                                            </Text>
                                            <Text className="text-base font-bold text-gray-900">
                                                {selectedStartDate.toLocaleDateString("vi-VN", {
                                                    weekday: "long",
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                })}
                                            </Text>
                                        </View>
                                        <Ionicons name="calendar" size={32} color="#F97316" />
                                    </View>
                                </View>
                            )}
                        </View>

                        {/* Footer */}
                        <View className="px-6 pb-6 pt-2 flex-row gap-3">
                            <TouchableOpacity
                                onPress={() => {
                                    setShowDatePickerModal(false);
                                    setCurrentMonth(new Date());
                                    setSelectedStartDate(new Date());

                                    // Clear AI-generated plans nếu cancel
                                    setAiGeneratedPlans(null);

                                    // Restore lại state trước khi mở modal
                                    setViewMode(backupViewMode);
                                    setEditingPlans(backupEditingPlans);
                                    setHasChanges(backupHasChanges);
                                }}
                                className="flex-1 px-4 py-3 bg-gray-100 rounded-xl items-center"
                            >
                                <Text className="text-gray-700 font-medium">Hủy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => {
                                    if (!selectedStartDate || isDateDisabled(selectedStartDate)) {
                                        Toast.show({
                                            type: "error",
                                            text1: "Thông báo",
                                            text2: "Vui lòng chọn ngày hợp lệ",
                                            position: "top",
                                            visibilityTime: 3000,
                                        });
                                        return;
                                    }

                                    // Nếu có AI-generated plans, thêm date vào mỗi plan
                                    if (aiGeneratedPlans && aiGeneratedPlans.length > 0) {
                                        const plansWithDate: DayPlan[] = aiGeneratedPlans.map((plan, index) => {
                                            const date = new Date(selectedStartDate);
                                            date.setDate(selectedStartDate.getDate() + index);
                                            
                                            // Format date without timezone issues
                                            const year = date.getFullYear();
                                            const month = String(date.getMonth() + 1).padStart(2, '0');
                                            const day = String(date.getDate()).padStart(2, '0');
                                            const dateString = `${year}-${month}-${day}`;
                                            
                                            return {
                                                date: dateString,
                                                morning: plan.morning || {},
                                                noon: plan.noon || {},
                                                evening: plan.evening || {}
                                            };
                                        });
                                        
                                        setEditingPlans(plansWithDate);
                                        setOriginalPlans([]); // Creating mode không cần originalPlans
                                        setAiGeneratedPlans(null); // Clear AI plans đã dùng
                                    } else {
                                        // Tạo plan thủ công (không có AI)
                                        setEditingPlans([]);
                                        setOriginalPlans([]);
                                    }

                                    // Chỉ khi XÁC NHẬN mới đổi viewMode
                                    setViewMode("creating");
                                    setHasChanges(false);
                                    setShowDatePickerModal(false);
                                }}
                                disabled={!selectedStartDate || isDateDisabled(selectedStartDate)}
                                className={`flex-1 px-4 py-3 rounded-xl items-center flex-row justify-center ${!selectedStartDate || isDateDisabled(selectedStartDate)
                                    ? "bg-gray-300"
                                    : "bg-orange-500"
                                    }`}
                            >
                                <Ionicons
                                    name="checkmark-circle"
                                    size={20}
                                    color="#FFF"
                                    style={{ marginRight: 8 }}
                                />
                                <Text className="text-white font-medium">Xác Nhận</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Recipe Selector Modal */}
            <Modal
                visible={showRecipeSelector}
                animationType="slide"
                onRequestClose={() => setShowRecipeSelector(false)}
            >
                <View className="flex-1 bg-white">
                    {/* Header */}
                    <View className="bg-orange-500 pt-12 pb-4 px-4">
                        <View className="flex-row items-center justify-between">
                            <Text className="text-white text-xl font-bold">
                                Chọn món ăn
                            </Text>
                            <TouchableOpacity
                                onPress={() => setShowRecipeSelector(false)}
                                className="p-2"
                            >
                                <Ionicons name="close" size={28} color="#FFF" />
                            </TouchableOpacity>
                        </View>

                        {/* Search */}
                        <View className="bg-white rounded-xl flex-row items-center px-4 py-3 mt-4">
                            <Ionicons name="search" size={20} color="#9CA3AF" />
                            <TextInput
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                placeholder="Tìm kiếm món ăn..."
                                className="flex-1 ml-2 text-base"
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>
                    </View>

                    {/* Recipe List */}
                    <ScrollView className="flex-1 px-4 py-4">
                        {filteredRecipes.map((recipe) => (
                            <TouchableOpacity
                                key={recipe._id}
                                onPress={() => {
                                    if (selectedSlot) {
                                        addRecipeToMeal(
                                            selectedSlot.date,
                                            selectedSlot.mealType,
                                            recipe._id
                                        );
                                    }
                                }}
                                className="bg-gray-50 rounded-xl p-3 flex-row items-center mb-3"
                            >
                                <Image
                                    source={{ uri: recipe.image }}
                                    className="w-20 h-20 rounded-lg"
                                    resizeMode="cover"
                                />
                                <View className="flex-1 ml-3">
                                    <Text
                                        className="text-base font-semibold text-gray-900"
                                        numberOfLines={2}
                                    >
                                        {recipe.name}
                                    </Text>
                                    <Text className="text-sm text-gray-600 mt-1">
                                        {recipe.time} phút • {recipe.difficulty}
                                    </Text>
                                    <View className="flex-row items-center mt-1">
                                        <Ionicons name="star" size={14} color="#FBBF24" />
                                        <Text className="text-xs text-gray-600 ml-1">
                                            {recipe.rate?.toFixed(1) || "0.0"}
                                        </Text>
                                    </View>
                                </View>
                                <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                visible={showDeleteConfirmModal}
                animationType="fade"
                transparent
                onRequestClose={() => setShowDeleteConfirmModal(false)}
            >
                <View className="flex-1 bg-black/50 justify-center items-center p-4">
                    <View className="bg-white rounded-3xl w-full max-w-sm overflow-hidden">
                        {/* Header */}
                        <View className="bg-red-500 p-6">
                            <View className="items-center">
                                <View className="bg-white/20 p-4 rounded-full mb-4">
                                    <Ionicons name="warning" size={40} color="#FFF" />
                                </View>
                                <Text className="text-white text-2xl font-bold text-center">
                                    Xác nhận xóa
                                </Text>
                            </View>
                        </View>

                        {/* Content */}
                        <View className="p-6">
                            <Text className="text-gray-800 text-base text-center mb-2">
                                Bạn có chắc chắn muốn xóa kế hoạch này không?
                            </Text>
                            <Text className="text-gray-500 text-sm text-center">
                                Hành động này không thể hoàn tác
                            </Text>
                        </View>

                        {/* Footer */}
                        <View className="px-6 pb-6 pt-2 flex-row gap-3">
                            <TouchableOpacity
                                onPress={() => setShowDeleteConfirmModal(false)}
                                className="flex-1 px-4 py-3 bg-gray-100 rounded-xl items-center"
                            >
                                <Text className="text-gray-700 font-semibold text-base">Không</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={confirmDeletePlan}
                                className="flex-1 px-4 py-3 bg-red-500 rounded-xl items-center"
                            >
                                <Text className="text-white font-semibold text-base">Có, xóa</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Toast Messages with custom config */}
            <Toast />
        </View>
    );
}
