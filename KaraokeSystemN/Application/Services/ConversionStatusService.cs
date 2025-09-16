namespace KaraokeSystemN.Application.Services
{
    public class ConversionStatusService
    {
        public string CurrentStatus { get; private set; } = "Ocioso";

        public void UpdateStatus(string message)
        {
            CurrentStatus = message;
        }
    }
}
