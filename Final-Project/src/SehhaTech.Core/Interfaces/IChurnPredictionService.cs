using SehhaTech.Core.DTOs;

namespace SehhaTech.Core.Interfaces
{
    public interface IChurnPredictionService
    {
        // بيحسب score مختصر لعيادة واحدة - يستخدم في القائمة العامة لكل العيادات
        Task<ChurnScoreDto> CalculateScoreAsync(int tenantId);

        // بيحسب scores لمجموعة عيادات مرة واحدة (أداء أفضل من استدعاء CalculateScoreAsync في loop)
        Task<Dictionary<int, ChurnScoreDto>> CalculateScoresBulkAsync(IEnumerable<int> tenantIds);

        // بيرجع تفصيل كامل لعيادة واحدة - يستخدم في صفحة تفاصيل العيادة
        Task<ChurnScoreDetailDto> CalculateDetailedScoreAsync(int tenantId);
    }
}
