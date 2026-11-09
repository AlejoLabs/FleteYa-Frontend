import { ErrorResponse } from "../../../../domain/models/ErrorResponse";
import { UserUseCases } from "../../../../domain/useCases/user/UserUseCases";
import { currentLanguage, setLanguage } from "../../../../i18n";
import { LANGUAGES, LanguageCode } from "../../../../i18n/languages";

// Elegir el idioma de la app: cambia al instante en el teléfono y se guarda en la cuenta
export class ProfileLanguageViewModel {
    private userUseCases: UserUseCases;

    constructor(userUseCases: UserUseCases) {
        this.userUseCases = userUseCases;
    }

    options() {
        return LANGUAGES;
    }

    current(): LanguageCode {
        return currentLanguage();
    }

    // Devuelve el error del servidor si no pudo guardarlo en la cuenta; el idioma del teléfono ya cambió
    async select(language: LanguageCode): Promise<true | ErrorResponse> {
        await setLanguage(language);
        const response = await this.userUseCases.updateLanguage.execute(language);
        return 'statusCode' in response ? response : true;
    }
}
