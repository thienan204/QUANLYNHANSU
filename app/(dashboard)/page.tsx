import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  // Fetch summary data
  const employeeCount = await prisma.nHANVIEN.count();
  const userCount = await prisma.user.count();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 text-sm">Chào mừng quay trở lại, {session?.user?.name || "Admin"}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Widget 1: Total Employees */}
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tổng Nhân viên</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-1">{employeeCount}</h3>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            <span className="text-green-500 font-medium">↑ 12%</span> so với tháng trước
          </div>
        </div>

        {/* Widget 2: Contracts (Mock) */}
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-orange-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Hợp đồng sắp hết hạn</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-1">5</h3>
            </div>
            <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            Cần xử lý trong tuần này
          </div>
        </div>

        {/* Widget 3: Reports (Mock) */}
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Báo cáo mới</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-1">28</h3>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            Đã cập nhật hôm qua
          </div>
        </div>

        {/* Widget 4: Total Users */}
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tài khoản User</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-1">{userCount}</h3>
            </div>
            <div className="p-2 bg-green-50 rounded-lg text-green-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            <span className="text-green-500 font-medium">Active</span>
          </div>
        </div>
      </div>

      {/* Recent Activity / Table section - Mock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-bold text-gray-800 mb-4">Hoạt động gần đây</h3>
          <ul className="space-y-3">
            <li className="flex items-center text-sm text-gray-600">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              Admin đã thêm nhân viên mới "Nguyễn Văn A" (09:00 SA)
            </li>
            <li className="flex items-center text-sm text-gray-600">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
              Admin đã cập nhật thông tin nhân viên "Trần Thị B" (08:30 SA)
            </li>
            <li className="flex items-center text-sm text-gray-600">
              <span className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></span>
              Hệ thống sao lưu dữ liệu tự động (00:00 SA)
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-bold text-gray-800 mb-4">Thông báo</h3>
          <div className="bg-blue-50 p-4 rounded-lg flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 0 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-blue-800">Cập nhật hệ thống</p>
              <p className="text-sm text-blue-600 mt-1">Hệ thống sẽ bảo trì vào 12:00 PM Chủ Nhật tuần này. Vui lòng lưu lại công việc của bạn.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
