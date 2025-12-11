/**
 * Character Service
 * Business logic for character-related operations
 * Extracted from backend_old routers and types
 */

import { Server } from '@/types/Server';
import { Character } from '@/types/Character';
import { BestdoriClient } from '@/lib/clients/BestdoriClient';
import { fuzzySearch, FuzzySearchResult, match, loadConfig } from '@/lib/fuzzy-search';

export class CharacterService {
    private bestdoriClient: BestdoriClient;
    private charactersCache: { [characterId: string]: any } | null = null;

    constructor(bestdoriClient?: BestdoriClient) {
        this.bestdoriClient = bestdoriClient || new BestdoriClient();
    }

    /**
     * Load all characters data (cached)
     */
    private async loadAllCharacters(): Promise<{ [characterId: string]: any }> {
        if (!this.charactersCache) {
            const charactersData = await this.bestdoriClient.getAllCharacters();
            this.charactersCache = charactersData as { [characterId: string]: any };
        }
        return this.charactersCache;
    }

    /**
     * Get character by ID
     */
    async getCharacterById(characterId: number): Promise<Character | null> {
        try {
            const charactersData = await this.loadAllCharacters();
            const characterData = charactersData[characterId.toString()];
            if (!characterData) {
                return null;
            }

            const character = new Character(characterId, characterData);
            return character.isExist ? character : null;
        } catch (e) {
            console.error('Failed to get character:', e);
            return null;
        }
    }

    /**
     * Get character with full data by ID
     */
    async getCharacterFullById(characterId: number): Promise<Character | null> {
        try {
            const character = await this.getCharacterById(characterId);
            if (!character || !character.isExist) {
                return null;
            }

            // Load full character data if not already loaded
            if (!character.isInitFull) {
                const fullCharacterData = await this.bestdoriClient.getCharacterRaw(characterId);
                character.initFromFullData(fullCharacterData);
            }

            return character;
        } catch (e) {
            console.error('Failed to get character full:', e);
            return null;
        }
    }

    /**
     * Search characters by keyword using fuzzy search
     */
    async searchCharacters(keyword: string, displayedServerList: Server[]): Promise<Character[]> {
        try {
            const fuzzySearchConfig = loadConfig();
            const fuzzySearchResult = fuzzySearch(keyword, fuzzySearchConfig);
            
            const charactersData = await this.loadAllCharacters();
            const matchedCharacters: Character[] = [];

            for (const characterId in charactersData) {
                const characterData = charactersData[characterId];
                const character = new Character(parseInt(characterId), characterData);
                
                if (!character.isExist) {
                    continue;
                }

                // Check if character matches fuzzy search criteria
                if (this.matchesFuzzySearch(character, fuzzySearchResult, displayedServerList)) {
                    matchedCharacters.push(character);
                }
            }

            return matchedCharacters;
        } catch (e) {
            console.error('Failed to search characters:', e);
            return [];
        }
    }

    /**
     * Check if character matches fuzzy search criteria
     */
    private matchesFuzzySearch(character: Character, fuzzyResult: FuzzySearchResult, displayedServerList: Server[]): boolean {
        // Basic match using fuzzy search utils
        const numberTypeKeys = ['characterId', 'bandId'];
        let basicMatch = match(fuzzyResult, character, numberTypeKeys);

        // Check if character is available in displayed servers
        // Characters are always available, but we can check bandId if needed
        return basicMatch;
    }

    /**
     * Get characters by band ID
     */
    async getCharactersByBandId(bandId: number): Promise<Character[]> {
        try {
            const charactersData = await this.loadAllCharacters();
            const characters: Character[] = [];

            for (const characterId in charactersData) {
                const characterData = charactersData[characterId];
                if (characterData && characterData['bandId'] === bandId) {
                    const character = new Character(parseInt(characterId), characterData);
                    if (character.isExist) {
                        characters.push(character);
                    }
                }
            }

            return characters;
        } catch (e) {
            console.error('Failed to get characters by band:', e);
            return [];
        }
    }

    /**
     * Build character ID to band ID map
     */
    async buildCharacterBandIdMap(): Promise<Map<number, number>> {
        const charactersData = await this.loadAllCharacters();
        const bandIdMap = new Map<number, number>();

        for (const characterId in charactersData) {
            const characterData = charactersData[characterId];
            if (characterData && characterData['bandId'] != null) {
                bandIdMap.set(parseInt(characterId), characterData['bandId']);
            }
        }

        return bandIdMap;
    }
}

