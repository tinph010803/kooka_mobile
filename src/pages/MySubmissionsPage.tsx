import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { fetchMySubmissions, deleteSubmission } from "../redux/slices/submissionSlice";
import Toast from "react-native-toast-message";

export default function MySubmissionsPage() {
    const navigation = useNavigation();
    const dispatch = useAppDispatch();
    const { mySubmissions, loading } = useAppSelector((state) => state.submissions);
    const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        dispatch(fetchMySubmissions());
    }, [dispatch]);

    const onRefresh = async () => {
        setRefreshing(true);
        await dispatch(fetchMySubmissions());
        setRefreshing(false);
    };

    const handleDelete = async (id: string) => {
        try {
            await dispatch(deleteSubmission(id)).unwrap();
            Toast.show({
                type: "success",
                text1: "✅ Đã xóa đề xuất",
                position: "top",
            });
        } catch (error) {
            Toast.show({
                type: "error",
                text1: "❌ Lỗi khi xóa đề xuất",
                position: "top",
            });
        }
    };

    const filteredSubmissions = mySubmissions.filter((sub) => {
        if (filter === "all") return true;
        return sub.status === filter;
    });

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "pending":
                return "time-outline";
            case "approved":
                return "checkmark-circle";
            case "rejected":
                return "close-circle";
            default:
                return "help-circle";
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "pending":
                return "Đang chờ duyệt";
            case "approved":
                return "Đã duyệt";
            case "rejected":
                return "Bị từ chối";
            default:
                return status;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "pending":
                return { bg: "bg-yellow-100", text: "text-yellow-700", icon: "#F59E0B" };
            case "approved":
                return { bg: "bg-green-100", text: "text-green-700", icon: "#10B981" };
            case "rejected":
                return { bg: "bg-red-100", text: "text-red-700", icon: "#EF4444" };
            default:
                return { bg: "bg-gray-100", text: "text-gray-700", icon: "#6B7280" };
        }
    };

    const pendingCount = mySubmissions.filter((sub) => sub.status === "pending").length;
    const approvedCount = mySubmissions.filter((sub) => sub.status === "approved").length;
    const rejectedCount = mySubmissions.filter((sub) => sub.status === "rejected").length;

    if (loading && mySubmissions.length === 0) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50">
                <ActivityIndicator size="large" color="#F97316" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-white pt-12 pb-4 px-4 shadow-sm">
                <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center flex-1">
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            className="mr-3"
                        >
                            <Ionicons name="arrow-back" size={24} color="#111827" />
                        </TouchableOpacity>
                        <View className="flex-1">
                            <Text className="text-2xl font-bold text-gray-900">
                                Đề Xuất Của Tôi
                            </Text>
                            <Text className="text-gray-600 text-sm">
                                Quản lý các đề xuất công thức
                            </Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        // @ts-ignore
                        onPress={() => navigation.navigate("SuggestRecipe")}
                        className="bg-orange-500 w-10 h-10 rounded-xl items-center justify-center"
                    >
                        <Ionicons name="add" size={24} color="#FFF" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Stats Cards */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="px-4 py-2"
            >
                <View className="bg-blue-50 rounded-xl p-2 mr-2 w-24">
                    <View className="items-center">
                        <Ionicons name="calendar" size={20} color="#3B82F6" />
                        <Text className="text-lg font-bold text-gray-900 mt-1">
                            {mySubmissions.length}
                        </Text>
                        <Text className="text-gray-600 text-xs">Tất cả</Text>
                    </View>
                </View>

                <View className="bg-yellow-50 rounded-xl p-2 mr-2 w-24">
                    <View className="items-center">
                        <Ionicons name="time-outline" size={20} color="#F59E0B" />
                        <Text className="text-lg font-bold text-yellow-700 mt-1">
                            {pendingCount}
                        </Text>
                        <Text className="text-gray-600 text-xs">Chờ duyệt</Text>
                    </View>
                </View>

                <View className="bg-green-50 rounded-xl p-2 mr-2 w-24">
                    <View className="items-center">
                        <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                        <Text className="text-lg font-bold text-green-700 mt-1">
                            {approvedCount}
                        </Text>
                        <Text className="text-gray-600 text-xs">Đã duyệt</Text>
                    </View>
                </View>

                <View className="bg-red-50 rounded-xl p-2 w-24">
                    <View className="items-center">
                        <Ionicons name="close-circle" size={20} color="#EF4444" />
                        <Text className="text-lg font-bold text-red-700 mt-1">
                            {rejectedCount}
                        </Text>
                        <Text className="text-gray-600 text-xs mt-0.5">Bị từ chối</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Filter Tabs */}
            <View className="bg-white mx-4 rounded-xl shadow-sm overflow-hidden mb-4">
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <TouchableOpacity
                        onPress={() => setFilter("all")}
                        className={`px-5 py-3 border-b-2 ${
                            filter === "all" ? "border-orange-500" : "border-transparent"
                        }`}
                    >
                        <Text
                            className={`font-semibold text-sm ${
                                filter === "all" ? "text-orange-600" : "text-gray-600"
                            }`}
                        >
                            Tất cả ({mySubmissions.length})
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setFilter("pending")}
                        className={`px-5 py-3 border-b-2 ${
                            filter === "pending" ? "border-orange-500" : "border-transparent"
                        }`}
                    >
                        <Text
                            className={`font-semibold text-sm ${
                                filter === "pending" ? "text-orange-600" : "text-gray-600"
                            }`}
                        >
                            Chờ duyệt ({pendingCount})
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setFilter("approved")}
                        className={`px-5 py-3 border-b-2 ${
                            filter === "approved" ? "border-orange-500" : "border-transparent"
                        }`}
                    >
                        <Text
                            className={`font-semibold text-sm ${
                                filter === "approved" ? "text-orange-600" : "text-gray-600"
                            }`}
                        >
                            Đã duyệt ({approvedCount})
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setFilter("rejected")}
                        className={`px-5 py-3 border-b-2 ${
                            filter === "rejected" ? "border-orange-500" : "border-transparent"
                        }`}
                    >
                        <Text
                            className={`font-semibold text-sm ${
                                filter === "rejected" ? "text-orange-600" : "text-gray-600"
                            }`}
                        >
                            Bị từ chối ({rejectedCount})
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>

            {/* Submissions List */}
            <ScrollView
                className="flex-1 px-4"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {filteredSubmissions.length === 0 ? (
                    <View className="bg-white rounded-2xl p-12 items-center">
                        <Ionicons name="document-outline" size={64} color="#D1D5DB" />
                        <Text className="text-gray-500 text-lg mt-4">Chưa có đề xuất nào</Text>
                    </View>
                ) : (
                    filteredSubmissions.map((submission) => {
                        const statusColor = getStatusColor(submission.status);
                        return (
                            <View
                                key={submission._id}
                                className="bg-white rounded-2xl shadow-sm mb-4 overflow-hidden"
                            >
                                <View className="flex-row">
                                    {/* Image */}
                                    <Image
                                        source={{ uri: submission.image }}
                                        className="w-28 h-32"
                                        resizeMode="cover"
                                    />

                                    {/* Content */}
                                    <View className="flex-1 p-3">
                                        <View className="flex-row items-start justify-between mb-2">
                                            <Text className="text-base font-bold text-gray-900 flex-1 mr-2">
                                                {submission.name}
                                            </Text>
                                            <View className={`${statusColor.bg} px-2 py-1 rounded-full flex-row items-center`}>
                                                <Ionicons
                                                    name={getStatusIcon(submission.status)}
                                                    size={14}
                                                    color={statusColor.icon}
                                                />
                                                <Text className={`text-xs font-medium ml-1 ${statusColor.text}`}>
                                                    {getStatusText(submission.status)}
                                                </Text>
                                            </View>
                                        </View>

                                        <Text className="text-gray-600 text-sm mb-2" numberOfLines={2}>
                                            {submission.short}
                                        </Text>

                                        <View className="flex-row flex-wrap gap-2 mb-2">
                                            <View className="flex-row items-center">
                                                <Ionicons name="time-outline" size={14} color="#6B7280" />
                                                <Text className="text-xs text-gray-600 ml-1">
                                                    {submission.time}p
                                                </Text>
                                            </View>
                                            <View className="flex-row items-center">
                                                <Ionicons name="people-outline" size={14} color="#6B7280" />
                                                <Text className="text-xs text-gray-600 ml-1">
                                                    {submission.size}
                                                </Text>
                                            </View>
                                            <View className="flex-row items-center">
                                                <Ionicons name="flame-outline" size={14} color="#6B7280" />
                                                <Text className="text-xs text-gray-600 ml-1">
                                                    {submission.calories}
                                                </Text>
                                            </View>
                                        </View>

                                        {submission.status === "rejected" && submission.rejectionReason && (
                                            <View className="bg-red-50 border border-red-200 rounded-lg p-2 mb-2">
                                                <Text className="text-xs font-semibold text-red-800">
                                                    ❌ Lý do từ chối:
                                                </Text>
                                                <Text className="text-xs text-red-700 mt-1">
                                                    {submission.rejectionReason}
                                                </Text>
                                            </View>
                                        )}

                                        {/* Actions */}
                                        <View className="flex-row gap-2">
                                            {submission.status === "approved" && submission.recipeId && (
                                                <TouchableOpacity
                                                    onPress={() =>
                                                        // @ts-ignore
                                                        navigation.navigate("RecipeDetail", {
                                                            recipeId: submission.recipeId,
                                                        })
                                                    }
                                                    className="flex-1 bg-green-500 py-2 rounded-lg flex-row items-center justify-center"
                                                >
                                                    <Ionicons name="eye-outline" size={16} color="#FFF" />
                                                    <Text className="text-white font-semibold text-xs ml-1">
                                                        Xem
                                                    </Text>
                                                </TouchableOpacity>
                                            )}

                                            {submission.status === "pending" && (
                                                <TouchableOpacity
                                                    onPress={() => handleDelete(submission._id)}
                                                    className="flex-1 bg-red-500 py-2 rounded-lg flex-row items-center justify-center"
                                                >
                                                    <Ionicons name="trash-outline" size={16} color="#FFF" />
                                                    <Text className="text-white font-semibold text-xs ml-1">
                                                        Xóa
                                                    </Text>
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    </View>
                                </View>
                            </View>
                        );
                    })
                )}
            </ScrollView>
        </View>
    );
}
