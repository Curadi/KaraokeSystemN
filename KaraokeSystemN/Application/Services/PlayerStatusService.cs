namespace KaraokeSystemN.Application.Services
{
    public class PlayerStatusService
    {
        private bool _isPlaying = false;

        public bool IsPlaying() => _isPlaying;

        public void SetIsPlaying(bool status)
        {
            _isPlaying = status;
        }
    }
}

