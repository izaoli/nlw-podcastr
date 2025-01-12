import styles from './styles.module.scss'
import { useEffect, useRef, useState } from 'react'

import Image from 'next/image'

import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'

import { usePlayer } from '../../contexts/PlayerContext'
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString'

export function Player() {
    const audioRef = useRef<HTMLAudioElement>(null)
    const [progress, setProgress] = useState(0)

    const {
        episodeList,
        currentEpisodeIndex,
        isPlaying,
        isLooping,
        isShuffling,
        togglePlay,
        toggleLoop,
        toggleShuffle,
        playNext,
        playPrevious,
        setPlayingState,
        hasNext,
        hasPrevious,
        clearPlayingState,
    } = usePlayer()

    useEffect(() => {
        if (!audioRef.current) {
            return;
        }
        if (isPlaying) {
            audioRef.current.play()
        } else {
            audioRef.current.pause()
        }
    }, [isPlaying])

    const setupProgressListener = () => {
        audioRef.current.currentTime = 0
        audioRef.current.addEventListener('timeupdate', event => {
            setProgress(Math.floor(audioRef.current.currentTime))
        })
    }

    const handleSeek = (amount: number) => {
        audioRef.current.currentTime = amount
        setProgress(amount)
    }

    const handleEpisodeEnded = () => {
        if (hasNext) {
            playNext()
        } else {
            clearPlayingState()
        }
    }

    const episode = episodeList[currentEpisodeIndex]

    return (
        <div className={styles.playerContainer}>
            <header>
                <img src="/playing.svg" alt="Tocando agora" />
                <strong>Tocando agora</strong>
            </header>

            {episode ? (
                <div className={styles.currentEpisode}>
                    <Image
                        width={592}
                        height={592}
                        src={episode.thumbnail}
                        objectFit="cover" />
                    <strong>{episode.title}</strong>
                    <span>{episode.members}</span>
                </div>
            ) : (
                <div className={styles.emptyPlayer}>
                    <strong>Selecione um podcast para ouvir</strong>
                </div>
            )}

            <footer className={!episode ? styles.empty : ''}>
                <div className={styles.progress}>
                    <span>{convertDurationToTimeString(progress)}</span>
                    <div className={styles.slider}>
                        {episode ? (
                            <Slider
                                max={episode.duration}
                                value={progress}
                                onChange={handleSeek}
                                trackStyle={{ backgroundColor: '#04d361' }}
                                railStyle={{ backgroundColor: '#9f57ff' }}
                                handleStyle={{ borderColor: '04d361', borderWidth: 4 }}
                            />
                        ) : (
                            <div className={styles.emptySlider} />
                        )}
                    </div>
                    <span>{convertDurationToTimeString(episode?.duration ?? 0)}</span>
                </div>

                {episode && (
                    <audio
                        src={episode.url}
                        ref={audioRef}
                        onLoadedMetadata={() => setupProgressListener()}
                        onPlay={() => setPlayingState(true)}
                        onPause={() => setPlayingState(false)}
                        onEnded={handleEpisodeEnded}
                        loop={isLooping}
                        autoPlay
                    />
                )}

                <div className={styles.buttons}>
                    <button type="button"
                        disabled={!episode || episodeList.length <= 1}
                        onClick={toggleShuffle} className={isShuffling ? styles.isActive : ''}>
                        <img src="/shuffle.svg" alt="Embaralhar" />
                    </button>
                    <button type="button" disabled={!(episode && hasPrevious)}
                        onClick={playPrevious}>
                        <img src="/play-previous.svg" alt="Tocar anterior" />
                    </button>
                    <button type="button" disabled={!episode}
                        className={styles.playButton}
                        onClick={togglePlay}>
                        {isPlaying ? (
                            <img src="/pause.svg" alt="Pausar" />
                        ) : (
                            <img src="/play.svg" alt="Tocar" />
                        )}
                    </button>
                    <button type="button" disabled={!(episode && hasNext)}
                        onClick={playNext}>
                        <img src="/play-next.svg" alt="Tocar próxima" />
                    </button>
                    <button type="button" disabled={!episode}
                        onClick={toggleLoop} className={isLooping ? styles.isActive : ''}>
                        <img src="/repeat.svg" alt="Repetir" />
                    </button>
                </div>
            </footer>
        </div>
    )
}