import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Calendar,
  Phone,
  Mail,
  Lock,
  Map,
  MapPin,
  Clock,
  Banknote,
  Users,
  Check,
  ArrowUpToLine,
  AlertCircle,
  ArrowLeftRight,
  Eye,
  EyeOff,
  Building,
  FileText,
} from "lucide-react";
import { onboardingTeamService } from "../../api/onboardingTeamService";
import PageHeader from "../../components/common/PageHeader";
import TableWrapper from "../../components/common/TableWrapper";
import { SkeletonDetailView } from "../../components/common/Skeleton";

const DetailCard = ({ icon: Icon, label, value }) => (
  <div className="bg-[#f8f9fa] rounded-xl p-4 flex items-center gap-4">
    <div className="text-[#225091] flex-shrink-0">
      <Icon size={20} strokeWidth={2} />
    </div>
    <div>
      <p className="text-[13px] text-gray-500 font-medium mb-0.5">{label}</p>
      <p className="text-[#1b2559] font-bold text-[14px]">{value}</p>
    </div>
  </div>
);

const ViewOnboardingTeam = () => {
  const { id } = useParams();
  const [onboardingTeamData, setOnboardingTeamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const fetchMemberDetails = async () => {
      try {
        setLoading(true);
        const res = await (onboardingTeamService.getOnboardingTeamDetails || onboardingTeamService.getMemberById)(id);
        if (res && (res.success || res.data)) {
          setOnboardingTeamData(res.data || res);
        }
      } catch (err) {
        console.error("Failed to load onboarding team member details", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMemberDetails();
    }
  }, [id]);

  if (loading) {
    return <SkeletonDetailView />;
  }

  if (!onboardingTeamData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Onboarding Team Member not found.</p>
        <Link
          to="/onboarding-team"
          className="text-[#225091] font-semibold hover:underline"
        >
          Back to List
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      {/* Page Header */}
      <PageHeader
        title="Onboarding Team Member Details"
        showBack={true}
        backUrl="/onboarding-team"
        breadcrumbs={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'User Management' },
          { label: 'Onboarding Team', to: '/onboarding-team' },
          { label: 'Details' },
        ]}
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
        {/* Profile Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-[72px] h-[72px] rounded-full border-[3px] border-[#225091] overflow-hidden bg-gray-100 flex items-center justify-center shadow-sm shrink-0">
              {onboardingTeamData.profileImage ? (
                <img
                  src={onboardingTeamData.profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[#f4f2ff] text-[#225091] flex items-center justify-center text-2xl font-bold">
                  {onboardingTeamData.fullName?.substring(0, 2).toUpperCase() ||
                    "NA"}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-[22px] font-bold text-[#1b2559] mb-1.5">
                {onboardingTeamData.fullName}
              </h2>
              <span className="inline-block px-3.5 py-1 bg-[#225091] text-white text-[12px] font-semibold rounded-full">
                {onboardingTeamData.onboardingTeamType}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <Link
              to="/letters-payroll"
              state={{
                employeeId: onboardingTeamData._id || onboardingTeamData.id,
                employeeModel: 'OnboardingTeam',
                letterType: 'Offer Letter',
              }}
              className="bg-[#225091] hover:bg-[#193e73] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer shrink-0"
            >
              <FileText size={15} />
              <span>Generate Official Letter</span>
            </Link>

            <div className="flex bg-[#f4f2ff] rounded-xl p-4 gap-8">
            <div>
              <p className="text-[13px] text-gray-500 font-medium mb-1">
                Shift
              </p>
              <p className="text-[14px] text-[#1b2559] font-bold">
                {onboardingTeamData.meta?.shift || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-[13px] text-gray-500 font-medium mb-1">
                Weekly Off
              </p>
              <p className="text-[14px] text-[#1b2559] font-bold">
                {onboardingTeamData.meta?.weeklyOff || "N/A"}
              </p>
            </div>
              <div>
                <p className="text-[13px] text-gray-500 font-medium mb-1">
                  Joined
                </p>
                <p className="text-[14px] text-[#1b2559] font-bold">
                  {onboardingTeamData.meta?.joined || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <hr className="border-gray-100 my-8" />

        {/* Personal Details */}
        <div className="mb-10">
          <h2 className="text-[22px] font-bold text-[#333] mb-6">
            Personal Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DetailCard
              icon={Users}
              label="Gender"
              value={onboardingTeamData.personalDetails?.gender || "N/A"}
            />
            <DetailCard
              icon={Calendar}
              label="Date Of Birth"
              value={onboardingTeamData.personalDetails?.dateOfBirth || "N/A"}
            />
            <DetailCard
              icon={Phone}
              label="Phone"
              value={onboardingTeamData.personalDetails?.phone || "N/A"}
            />
            <DetailCard
              icon={Mail}
              label="Email"
              value={onboardingTeamData.personalDetails?.email || "N/A"}
            />
            <div className="bg-[#f8f9fa] rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <div className="text-[#225091] flex-shrink-0">
                  <Lock size={20} strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] text-gray-500 font-medium mb-0.5">Password</p>
                  <p className="text-[#1b2559] font-bold text-[14px] truncate font-mono">
                    {onboardingTeamData.personalDetails?.password
                      ? (showPassword ? onboardingTeamData.personalDetails.password : "••••••••")
                      : "••••••••"}
                  </p>
                </div>
              </div>
              {onboardingTeamData.personalDetails?.password && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-[#225091] p-1.5 rounded-lg hover:bg-gray-200/60 transition-colors focus:outline-none cursor-pointer shrink-0"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              )}
            </div>
            <DetailCard
              icon={MapPin}
              label="Address"
              value={onboardingTeamData.personalDetails?.address || "N/A"}
            />
          </div>
        </div>

        <hr className="border-gray-100 my-8" />

        {/* Job Details */}
        <div className="mb-10">
          <h2 className="text-[22px] font-bold text-[#333] mb-6">
            Job Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DetailCard
              icon={Map}
              label="Region"
              value={onboardingTeamData.jobDetails?.region || "N/A"}
            />
            <DetailCard
              icon={MapPin}
              label="Branch"
              value={onboardingTeamData.jobDetails?.branch || "N/A"}
            />
            <DetailCard
              icon={Banknote}
              label="Salary"
              value={`Rs. ${onboardingTeamData.jobDetails?.salary || 0}`}
            />
          </div>
        </div>

        <hr className="border-gray-100 my-8" />

        {/* Shift & Woff */}
        <div className="mb-10">
          <h2 className="text-[22px] font-bold text-[#333] mb-6">
            Shift & Woff
          </h2>

          <div className="mb-8">
            <h3 className="text-[16px] font-bold text-[#333] mb-4">Shift</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailCard icon={Clock} label="In Time" value="10:00" />
              <DetailCard icon={Clock} label="Out Time" value="21:00" />
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-[16px] font-bold text-[#333] mb-4">
              Weekly Off
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailCard
                icon={Calendar}
                label="Weekly Off Days"
                value="Saturday, Sunday"
              />
              <div className="bg-[#f8f9fa] rounded-xl p-4 flex items-center gap-4">
                <div className="text-[#225091] flex-shrink-0">
                  <Check size={20} strokeWidth={2.5} />
                </div>
                <p className="text-[#1b2559] font-bold text-[14px]">
                  Weekly Of Payable
                </p>
              </div>
              <div className="bg-[#f8f9fa] rounded-xl p-4 flex items-center gap-4">
                <div className="text-[#225091] flex-shrink-0">
                  <Check size={20} strokeWidth={2.5} />
                </div>
                <p className="text-[#1b2559] font-bold text-[14px]">
                  Variable Weekly Off
                </p>
              </div>
              <div className="bg-[#f8f9fa] rounded-xl p-4 flex items-center gap-4">
                <div className="text-[#225091] flex-shrink-0">
                  <Check size={20} strokeWidth={2.5} />
                </div>
                <p className="text-[#1b2559] font-bold text-[14px]">
                  Second weekly off
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-[16px] font-bold text-[#333] mb-4">
              Other Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailCard
                icon={Clock}
                label="Late Allowed (Mins)"
                value="15 (As Per Shift)"
              />
              <DetailCard icon={Clock} label="Early Allowed (Min)" value="15" />
              <DetailCard icon={Clock} label="Half Day (Min)" value="240" />
              <DetailCard
                icon={Clock}
                label="Full Day (Min)"
                value="480 (As Per Shift)"
              />
            </div>
          </div>
        </div>

        <hr className="border-gray-100 my-8" />

        {/* Attendance */}
        <div>
          <h2 className="text-[22px] font-bold text-[#333] mb-6">Attendance</h2>

          <div>
            <h3 className="text-[16px] font-bold text-[#333] mb-4">Punch</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailCard
                icon={ArrowUpToLine}
                label="Shift Type"
                value="Double"
              />
              <DetailCard
                icon={AlertCircle}
                label="No Out- Punch Found - Action"
                value="Mark Half Day"
              />
              <DetailCard
                icon={Clock}
                label="Present On Wo / Holiday - Action"
                value="Mark as COFF"
              />
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-[16px] font-bold text-[#333] mb-4">Late Cut</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailCard icon={Calendar} label="Allowed Day" value="3" />
              <DetailCard
                icon={ArrowLeftRight}
                label="Action"
                value="Half Day"
              />
              <div className="bg-[#f8f9fa] rounded-xl p-4 flex items-center gap-4">
                <div className="text-[#225091] flex-shrink-0">
                  <Check size={20} strokeWidth={2.5} />
                </div>
                <p className="text-[#1b2559] font-bold text-[14px]">
                  Late Cut Allowed
                </p>
              </div>
              <div className="bg-[#f8f9fa] rounded-xl p-4 flex items-center gap-4">
                <div className="text-[#225091] flex-shrink-0">
                  <Check size={20} strokeWidth={2.5} />
                </div>
                <p className="text-[#1b2559] font-bold text-[14px]">
                  Extra Late Cut Deduction
                </p>
              </div>
              <div className="bg-[#f8f9fa] rounded-xl p-4 flex items-center gap-4">
                <div className="text-[#225091] flex-shrink-0">
                  <Check size={20} strokeWidth={2.5} />
                </div>
                <p className="text-[#1b2559] font-bold text-[14px]">
                  Additional Late Cut In Leave Balance
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-[16px] font-bold text-[#333] mb-4">
              Lunch & Early Going
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailCard
                icon={Clock}
                label="Lunch Allowed (Mins)"
                value="15 (As Per Shift)"
              />
              <div className="bg-[#f8f9fa] rounded-xl p-4 flex items-center gap-4">
                <div className="text-[#225091] flex-shrink-0">
                  <Check size={20} strokeWidth={2.5} />
                </div>
                <p className="text-[#1b2559] font-bold text-[14px]">
                  Lunch Allowed
                </p>
              </div>
              <div className="bg-[#f8f9fa] rounded-xl p-4 flex items-center gap-4">
                <div className="text-[#225091] flex-shrink-0">
                  <Check size={20} strokeWidth={2.5} />
                </div>
                <p className="text-[#1b2559] font-bold text-[14px]">
                  Early Going Allowed
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-[16px] font-bold text-[#333] mb-4">Overtime</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#f8f9fa] rounded-xl p-4 flex items-center gap-4">
                <div className="text-[#225091] flex-shrink-0">
                  <Check size={20} strokeWidth={2.5} />
                </div>
                <p className="text-[#1b2559] font-bold text-[14px]">
                  Overtime Allowed
                </p>
              </div>
              <div className="hidden md:block"></div>

              <div className="bg-[#f8f9fa] rounded-xl p-4 flex items-center gap-4">
                <div className="text-[#225091] flex-shrink-0">
                  <Check size={20} strokeWidth={2.5} />
                </div>
                <p className="text-[#1b2559] font-bold text-[14px]">
                  Custom OT
                </p>
              </div>
              <div className="bg-[#f8f9fa] rounded-xl p-4 flex items-center gap-4">
                <div className="text-[#225091] flex-shrink-0">
                  <Check size={20} strokeWidth={2.5} />
                </div>
                <p className="text-[#1b2559] font-bold text-[14px]">
                  Before OT
                </p>
              </div>

              <DetailCard
                icon={Clock}
                label="OT Grace Period (Mins)"
                value="5"
              />
              <DetailCard icon={Clock} label="1 day OT Hrs" value="4" />

              <div className="bg-[#f8f9fa] rounded-xl p-4 flex items-center gap-4">
                <div className="text-[#225091] flex-shrink-0">
                  <Check size={20} strokeWidth={2.5} />
                </div>
                <p className="text-[#1b2559] font-bold text-[14px]">
                  OT As Per Shift
                </p>
              </div>
              <div className="bg-[#f8f9fa] rounded-xl p-4 flex items-center gap-4">
                <div className="text-[#225091] flex-shrink-0">
                  <Check size={20} strokeWidth={2.5} />
                </div>
                <p className="text-[#1b2559] font-bold text-[14px]">
                  Consider OT As COFF
                </p>
              </div>
            </div>
          </div>
        </div>

        <hr className="border-gray-100 my-8" />

        {/* WOFF & HOFF */}
        <div>
          <h2 className="text-[22px] font-bold text-[#333] mb-6">
            WOFF & HOFF
          </h2>

          <div className="mb-8">
            <h3 className="text-[16px] font-bold text-[#333] mb-4">
              Sandwich Absence Rules - Weekly Off
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#f8f9fa] rounded-xl p-4 flex items-center gap-4">
                <div className="text-[#225091] flex-shrink-0">
                  <Check size={20} strokeWidth={2.5} />
                </div>
                <p className="text-[#1b2559] font-bold text-[14px]">
                  Absent Before Weekly Off
                </p>
              </div>
              <div className="bg-[#f8f9fa] rounded-xl p-4 flex items-center gap-4">
                <div className="text-[#225091] flex-shrink-0">
                  <Check size={20} strokeWidth={2.5} />
                </div>
                <p className="text-[#1b2559] font-bold text-[14px]">
                  Absent After Weekly Off
                </p>
              </div>
              <div className="bg-[#f8f9fa] rounded-xl p-4 flex items-center gap-4">
                <div className="text-[#225091] flex-shrink-0">
                  <Check size={20} strokeWidth={2.5} />
                </div>
                <p className="text-[#1b2559] font-bold text-[14px]">
                  Absent Before Or After Weekly Off
                </p>
              </div>
              <div className="bg-[#f8f9fa] rounded-xl p-4 flex items-center gap-4">
                <div className="text-[#225091] flex-shrink-0">
                  <Check size={20} strokeWidth={2.5} />
                </div>
                <p className="text-[#1b2559] font-bold text-[14px]">
                  Add Working Hrs On Weekly Off Day
                </p>
              </div>
              <div className="bg-[#f8f9fa] rounded-xl p-4 flex items-center gap-4">
                <div className="text-[#225091] flex-shrink-0">
                  <Check size={20} strokeWidth={2.5} />
                </div>
                <p className="text-[#1b2559] font-bold text-[14px]">
                  Late Deduction Not Applied On WO If Present
                </p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-[16px] font-bold text-[#333] mb-4">
              Sandwich Absence Rules - Holidays
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#f8f9fa] rounded-xl p-4 flex items-center gap-4">
                <div className="text-[#225091] flex-shrink-0">
                  <Check size={20} strokeWidth={2.5} />
                </div>
                <p className="text-[#1b2559] font-bold text-[14px]">
                  Absent Before Holiday
                </p>
              </div>
              <div className="bg-[#f8f9fa] rounded-xl p-4 flex items-center gap-4">
                <div className="text-[#225091] flex-shrink-0">
                  <Check size={20} strokeWidth={2.5} />
                </div>
                <p className="text-[#1b2559] font-bold text-[14px]">
                  Absent After Holiday
                </p>
              </div>
              <div className="bg-[#f8f9fa] rounded-xl p-4 flex items-center gap-4">
                <div className="text-[#225091] flex-shrink-0">
                  <Check size={20} strokeWidth={2.5} />
                </div>
                <p className="text-[#1b2559] font-bold text-[14px]">
                  Absent Before & After Holiday
                </p>
              </div>
              <div className="bg-[#f8f9fa] rounded-xl p-4 flex items-center gap-4">
                <div className="text-[#225091] flex-shrink-0">
                  <Check size={20} strokeWidth={2.5} />
                </div>
                <p className="text-[#1b2559] font-bold text-[14px]">
                  Add Working Hours On Holiday Day
                </p>
              </div>
              <div className="bg-[#f8f9fa] rounded-xl p-4 flex items-center gap-4">
                <div className="text-[#225091] flex-shrink-0">
                  <Check size={20} strokeWidth={2.5} />
                </div>
                <p className="text-[#1b2559] font-bold text-[14px]">
                  Late Deduction Not Applied On Holiday If Present
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-[16px] font-bold text-[#333] mb-4">
              Leave Between Holiday Or Weekly Off
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#f8f9fa] rounded-xl p-4 flex items-center gap-4">
                <div className="text-[#225091] flex-shrink-0">
                  <Check size={20} strokeWidth={2.5} />
                </div>
                <p className="text-[#1b2559] font-bold text-[14px]">
                  Consider "Weekly Off" In Leave Application
                </p>
              </div>
              <div className="bg-[#f8f9fa] rounded-xl p-4 flex items-center gap-4">
                <div className="text-[#225091] flex-shrink-0">
                  <Check size={20} strokeWidth={2.5} />
                </div>
                <p className="text-[#1b2559] font-bold text-[14px]">
                  Consider "Holiday" In Leave Application
                </p>
              </div>
              <div className="bg-[#f8f9fa] rounded-xl p-4 flex items-center gap-4">
                <div className="text-[#225091] flex-shrink-0">
                  <Check size={20} strokeWidth={2.5} />
                </div>
                <p className="text-[#1b2559] font-bold text-[14px]">
                  Absent - WO - Leave = WO Absent
                </p>
              </div>
              <div className="bg-[#f8f9fa] rounded-xl p-4 flex items-center gap-4">
                <div className="text-[#225091] flex-shrink-0">
                  <Check size={20} strokeWidth={2.5} />
                </div>
                <p className="text-[#1b2559] font-bold text-[14px]">
                  Leave - WO - Absent = WO Absent
                </p>
              </div>
              <div className="bg-[#f8f9fa] rounded-xl p-4 flex items-center gap-4">
                <div className="text-[#225091] flex-shrink-0">
                  <Check size={20} strokeWidth={2.5} />
                </div>
                <p className="text-[#1b2559] font-bold text-[14px]">
                  Absent - Holiday - Leave = Holiday Absent
                </p>
              </div>
              <div className="bg-[#f8f9fa] rounded-xl p-4 flex items-center gap-4">
                <div className="text-[#225091] flex-shrink-0">
                  <Check size={20} strokeWidth={2.5} />
                </div>
                <p className="text-[#1b2559] font-bold text-[14px]">
                  Leave - Holiday - Absent = Holiday Absent
                </p>
              </div>
            </div>
          </div>
        </div>

        <hr className="border-gray-100 my-8" />

        {/* Registration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DetailCard
            icon={Calendar}
            label="Registered On"
            value={onboardingTeamData.registeredOn || "N/A"}
          />
        </div>

        <hr className="border-gray-100 my-8" />

        {/* Onboarded Banks */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[22px] font-bold text-[#333]">
              Onboarded Banks
            </h2>
            <span className="bg-[#225091]/10 text-[#225091] px-3 py-1 rounded-full text-sm font-bold">
              Total: {onboardingTeamData.onboardedBanksCount || onboardingTeamData.onboardedBanks?.length || 0}
            </span>
          </div>

          {onboardingTeamData.onboardedBanks && onboardingTeamData.onboardedBanks.length > 0 ? (
            <div className="border border-gray-200/80 rounded-2xl overflow-hidden shadow-2xs">
              <TableWrapper>
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-[#225091] text-white text-xs uppercase tracking-wider font-semibold">
                      <th className="py-4 px-6 border-r border-white/20">Bank Name</th>
                      <th className="py-4 px-6 border-r border-white/20">Email</th>
                      <th className="py-4 px-6 border-r border-white/20">Phone Number</th>
                      <th className="py-4 px-6 border-r border-white/20">Status</th>
                      <th className="py-4 px-6">Payment Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {onboardingTeamData.onboardedBanks.map((bank, index) => (
                      <tr key={bank.id || index} className="hover:bg-[#F4F8FD] transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full border border-gray-200 overflow-hidden bg-gray-50 shrink-0 flex items-center justify-center">
                              {bank.logo ? (
                                <img src={bank.logo} alt={bank.bankName || bank.name} className="w-full h-full object-cover" />
                              ) : (
                                <Building size={16} className="text-gray-400" />
                              )}
                            </div>
                            <span className="text-sm text-gray-800 font-semibold">{bank.bankName || bank.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">{bank.email || "—"}</td>
                        <td className="py-4 px-6 text-sm text-gray-600">{bank.phoneNumber || "—"}</td>
                        <td className="py-4 px-6 text-sm">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase ${
                            bank.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-amber-50 text-amber-600 border border-amber-200'
                          }`}>
                            {bank.status || "UNKNOWN"}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-sm">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase ${
                            bank.paymentStatus === 'SUCCESS' ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-gray-50 text-gray-600 border border-gray-200'
                          }`}>
                            {bank.paymentStatus || "UNKNOWN"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableWrapper>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center text-gray-500 text-sm font-medium">
              No banks onboarded yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewOnboardingTeam;
