/**
 * Song Service
 * Business logic for song-related operations
 * Extracted from backend_old routers and types
 */

import { Server } from '@/types/Server';
import { Song, songInRank } from '@/types/Song';
import { BestdoriClient } from '@/lib/clients/BestdoriClient';
import { fuzzySearch, FuzzySearchResult, match, checkRelationList, loadConfig } from '@/lib/fuzzy-search';

export class SongService {
    private bestdoriClient: BestdoriClient;
    private songsCache: { [songId: string]: any } | null = null;
    private metaCache: any | null = null;

    constructor(bestdoriClient?: BestdoriClient) {
        this.bestdoriClient = bestdoriClient || new BestdoriClient();
    }

    /**
     * Load all songs data (cached)
     */
    private async loadAllSongs(): Promise<{ [songId: string]: any }> {
        if (!this.songsCache) {
            const songsData = await this.bestdoriClient.getAllSongs();
            this.songsCache = songsData as { [songId: string]: any };
        }
        return this.songsCache;
    }

    /**
     * Load meta data (cached)
     */
    private async loadMeta(): Promise<any> {
        if (!this.metaCache) {
            this.metaCache = await this.bestdoriClient.getAllMeta();
        }
        return this.metaCache;
    }

    /**
     * Get song by ID
     */
    async getSongById(songId: number): Promise<Song | null> {
        try {
            const songsData = await this.loadAllSongs();
            const songData = songsData[songId.toString()];
            if (!songData) {
                return null;
            }

            const metaData = await this.loadMeta();
            const songMeta = metaData[songId.toString()];
            
            const song = new Song(songId, songData, songMeta);
            return song.isExist ? song : null;
        } catch (e) {
            console.error('Failed to get song:', e);
            return null;
        }
    }

    /**
     * Search songs by keyword using fuzzy search
     */
    async searchSongs(keyword: string, displayedServerList: Server[]): Promise<Song[]> {
        try {
            const fuzzySearchConfig = loadConfig();
            const fuzzySearchResult = fuzzySearch(keyword, fuzzySearchConfig);
            
            const songsData = await this.loadAllSongs();
            const metaData = await this.loadMeta();
            const matchedSongs: Song[] = [];

            for (const songId in songsData) {
                const songData = songsData[songId];
                const song = new Song(parseInt(songId), songData, metaData[songId]);
                
                if (!song.isExist) {
                    continue;
                }

                // Check if song matches fuzzy search criteria
                if (this.matchesFuzzySearch(song, fuzzySearchResult, displayedServerList)) {
                    matchedSongs.push(song);
                }
            }

            return matchedSongs;
        } catch (e) {
            console.error('Failed to search songs:', e);
            return [];
        }
    }

    /**
     * Check if song matches fuzzy search criteria
     */
    private matchesFuzzySearch(song: Song, fuzzyResult: FuzzySearchResult, displayedServerList: Server[]): boolean {
        // Basic match using fuzzy search utils
        const numberTypeKeys = ['songId', 'bandId', 'songLevels'];
        let basicMatch = match(fuzzyResult, song, numberTypeKeys);

        // Check songLevels with relation strings
        if (fuzzyResult['_relationStr'] && song.songLevels.length > 0) {
            const relationMatch = song.songLevels.some(level => 
                checkRelationList(level, fuzzyResult['_relationStr'] as string[])
            );
            if (!relationMatch && fuzzyResult['_relationStr'].length > 0) {
                basicMatch = false;
            }
        }

        // Check if song is published in displayed servers
        if (displayedServerList && displayedServerList.length > 0) {
            const isPublished = displayedServerList.some(server => 
                song.publishedAt[server] != null
            );
            if (!isPublished) {
                return false;
            }
        }

        return basicMatch;
    }

    /**
     * Get meta ranking for songs
     */
    async getMetaRanking(withFever: boolean, mainServer: Server): Promise<songInRank[]> {
        try {
            const songsData = await this.loadAllSongs();
            const metaData = await this.loadMeta();
            const songRankList: songInRank[] = [];

            for (const songId in metaData) {
                const songData = songsData[songId];
                if (!songData) {
                    continue;
                }

                const song = new Song(parseInt(songId), songData, metaData[songId]);
                
                // Skip if not published in main server
                if (song.publishedAt[mainServer] == null) {
                    continue;
                }

                // Skip if no meta data
                if (!song.hasMeta) {
                    continue;
                }

                // Calculate meta for each difficulty
                for (const difficultyIdStr in song.difficulty) {
                    const difficultyId = parseInt(difficultyIdStr);
                    const meta = song.calcMeta(withFever, difficultyId);
                    songRankList.push({
                        songId: song.songId,
                        difficulty: difficultyId,
                        meta: meta,
                        rank: 0
                    });
                }
            }

            // Sort by meta value (descending)
            songRankList.sort((a, b) => b.meta - a.meta);

            // Assign ranks
            for (let i = 0; i < songRankList.length; i++) {
                songRankList[i].rank = i;
            }

            return songRankList;
        } catch (e) {
            console.error('Failed to get meta ranking:', e);
            return [];
        }
    }

    /**
     * Get present songs for a server (songs published within time range)
     */
    async getPresentSongs(mainServer: Server, start: number = Date.now(), end: number = Date.now()): Promise<Song[]> {
        try {
            const songsData = await this.loadAllSongs();
            const metaData = await this.loadMeta();
            const songList: Song[] = [];
            const addedSongIds = new Set<number>();

            for (const songId in songsData) {
                const songData = songsData[songId];
                const song = new Song(parseInt(songId), songData, metaData[songId]);

                if (!song.isExist) {
                    continue;
                }

                // Check if song was published in time range
                if (song.publishedAt[mainServer] != null) {
                    const publishedAt = song.publishedAt[mainServer];
                    if (publishedAt != null && publishedAt <= end && publishedAt >= start) {
                        if (!addedSongIds.has(song.songId)) {
                            songList.push(song);
                            addedSongIds.add(song.songId);
                        }
                    }
                }

                // Check if any difficulty was published in time range
                for (const difficultyId in song.difficulty) {
                    const difficulty = song.difficulty[parseInt(difficultyId)];
                    if (difficulty.publishedAt && difficulty.publishedAt[mainServer] != null) {
                        const publishedAt = difficulty.publishedAt[mainServer];
                        if (publishedAt != null && publishedAt <= end && publishedAt >= start) {
                            if (!addedSongIds.has(song.songId)) {
                                songList.push(song);
                                addedSongIds.add(song.songId);
                            }
                        }
                    }
                }
            }

            return songList;
        } catch (e) {
            console.error('Failed to get present songs:', e);
            return [];
        }
    }
}


