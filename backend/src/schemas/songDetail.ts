/**
 * Song Detail Schema Builder
 * Builds Tsugu Schema for song detail pages
 */

import { Song } from '@/types/Song';

/**
 * Build song detail schema
 * TODO: Implement based on Tsugu v5 design document
 */
export function buildSongDetailSchema(song: Song): any {
    return {
        schemaVersion: "1.0",
        componentName: "Page",
        id: `song-detail-${song.songId}`,
        props: {
            title: `歌曲 ${song.songId} 详情`
        },
        style: {
            background: "surface"
        },
        children: [
            {
                componentName: "Card",
                id: "song-info-card",
                props: {
                    title: "歌曲信息"
                },
                children: [
                    {
                        componentName: "SongInfo",
                        id: "song-info-main",
                        props: {
                            songId: song.songId,
                            musicTitle: song.musicTitle,
                            bandId: song.bandId,
                            difficulty: song.difficulty
                        }
                    }
                ]
            }
            // TODO: Add more components (chart, meta, etc.)
        ]
    };
}

