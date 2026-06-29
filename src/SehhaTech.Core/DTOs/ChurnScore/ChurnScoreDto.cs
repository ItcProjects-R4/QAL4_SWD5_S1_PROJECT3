namespace SehhaTech.Core.DTOs
{
    // النتيجة المختصرة - دي اللي بترجع جنب كل عيادة في GET /api/superadmin/tenants
    public class ChurnScoreDto
    {
        public int TenantId { get; set; }
        public int Score { get; set; } // 0 - 100 (كل ما زاد الرقم، زاد خطر فقدان العيادة)
        public string RiskLevel { get; set; } = string.Empty; // "Low" | "Medium" | "High" | "Critical"
    }

    // النتيجة المفصلة - دي اللي بترجع من /api/superadmin/tenants/{id}/churn-risk
    // فيها تفصيل كل عامل لوحده عشان SuperAdmin يفهم "ليه" العيادة دي في خطر
    public class ChurnScoreDetailDto
    {
        public int TenantId { get; set; }
        public string ClinicName { get; set; } = string.Empty;
        public int Score { get; set; }
        public string RiskLevel { get; set; } = string.Empty;
        public List<ChurnFactorDto> Factors { get; set; } = new();
        // ملاحظة: تم حذف Recommendation من هنا
        // الفرونت إند هيبني النص من RiskLevel مباشرة عبر مفاتيح الترجمة (i18n)
    }

    // كل عامل بمفرده - بيوضح ليه ساهم في الـ score بمقدار معين
    public class ChurnFactorDto
    {
        public string FactorName { get; set; } = string.Empty; // مثال: "NoRecentAppointments" - ده مفتاح الترجمة في الفرونت إند
        public Dictionary<string, object> Params { get; set; } = new(); // القيم الديناميكية (عدد الأيام، الأرقام) للحقن في نص الترجمة
        public int PointsContributed { get; set; } // كم نقطة ساهم بيها من الـ 100
        public int MaxPoints { get; set; } // أقصى نقاط ممكنة لهذا العامل
        public bool IsTriggered { get; set; } // هل العامل ده فعلاً متحقق في هذه العيادة؟
    }
}
