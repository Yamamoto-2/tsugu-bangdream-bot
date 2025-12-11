/**
 * Degree domain type
 * Migrated from backend_old/src/types/Degree.ts
 * Removed: HTTP calls, rendering methods (getDegreeImage, getDegreeFrame, getDegreeIcon, getFrameFromAnimatedDegreeAsset)
 * 
 * Note: Constructor still depends on mainAPI
 * This will be refactored to use BestdoriClient in the future
 */

import { Server } from './Server';
import { Bestdoriurl } from '@/config/constants';

export class Degree {
    degreeId: number;
    isExist: boolean = false;
    data!: object;
    degreeType!: Array<string | null>;
    iconImageName!: Array<string | null>;
    baseImageName!: Array<string | null>;
    rank!: Array<string | null>;
    degreeName!: Array<string | null>;

    /**
     * Constructor - creates Degree from degreeId
     * TODO: In the future, degreeData should be provided via BestdoriClient
     */
    constructor(degreeId: number, degreeData?: any) {
        this.degreeId = degreeId;
        
        if (!degreeData) {
            this.isExist = false;
            return;
        }

        this.isExist = true;
        this.data = degreeData;
        this.degreeType = degreeData['degreeType'];
        this.iconImageName = degreeData['iconImageName'];
        this.baseImageName = degreeData['baseImageName'];
        this.rank = degreeData['rank'];
        this.degreeName = degreeData['degreeName'];
    }

    /**
     * Get degree image URL (pure function, no HTTP calls)
     */
    getDegreeImageURL(server: Server, bestdoriUrl?: string): string {
        const Bestdoriurl = bestdoriUrl || 'https://bestdori.com';
        const temp_baseImageName = this.baseImageName[server];
        
        if (!temp_baseImageName) {
            return '';
        }

        // If starts with "ani_", return animated asset URL
        if (temp_baseImageName.startsWith("ani_")) {
            return `${Bestdoriurl}/assets/${Server[server]}/${temp_baseImageName}_rip/${temp_baseImageName}.png`;
        }
        
        return `${Bestdoriurl}/assets/${Server[server]}/thumb/degree_rip/${temp_baseImageName}.png`;
    }

    /**
     * Get degree frame URL (pure function, no HTTP calls)
     */
    getDegreeFrameURL(server: Server, bestdoriUrl?: string): string {
        const Bestdoriurl = bestdoriUrl || 'https://bestdori.com';
        const frameName = `${this.degreeType[server]}_${this.rank[server]}`;
        
        if (frameName == "none_none") {
            return '';
        }

        return `${Bestdoriurl}/assets/${Server[server]}/thumb/degree_rip/${frameName}.png`;
    }

    /**
     * Get degree icon URL (pure function, no HTTP calls)
     */
    getDegreeIconURL(server: Server, bestdoriUrl?: string): string {
        const Bestdoriurl = bestdoriUrl || 'https://bestdori.com';
        const iconName = `${this.iconImageName[server]}_${this.rank[server]}`;
        
        if (this.iconImageName[server] == "none") {
            return '';
        }

        return `${Bestdoriurl}/assets/${Server[server]}/thumb/degree_rip/${iconName}.png`;
    }

    /**
     * Get animated degree asset script URL (for animated degrees)
     */
    getAnimatedDegreeAssetScriptURL(server: Server, bestdoriUrl?: string): string {
        const Bestdoriurl = bestdoriUrl || 'https://bestdori.com';
        const temp_baseImageName = this.baseImageName[server];
        
        if (!temp_baseImageName || !temp_baseImageName.startsWith("ani_")) {
            return '';
        }

        return `${Bestdoriurl}/assets/${Server[server]}/${temp_baseImageName}_rip/assets-star-forassetbundle-startapp-thumbnail-animedegree-${temp_baseImageName}-${temp_baseImageName}.asset`;
    }

    /**
     * Check if degree is published on server
     */
    isPublished(server: Server): boolean {
        return this.degreeName[server] != null;
    }
}
