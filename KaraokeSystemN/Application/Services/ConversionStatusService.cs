namespace KaraokeSystemN.Application.Services
{
    // Este serviço será um 'Singleton', o que significa que haverá apenas uma instância
    // dele para toda a aplicação, permitindo que diferentes partes partilhem a informação.
    public class ConversionStatusService
    {
        public string CurrentStatus { get; private set; } = "Ocioso";

        public void UpdateStatus(string message)
        {
            CurrentStatus = message;
        }
    }
}
