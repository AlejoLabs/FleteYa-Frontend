import { CountryRepository } from "../../repository/CountryRepository";

export class GetCountriesUseCase {
    private countryRepository: CountryRepository;

    constructor({ countryRepository }: { countryRepository: CountryRepository }) {
        this.countryRepository = countryRepository;
    }

    async execute() {
        return await this.countryRepository.getCountries();
    }
}

// El país lo calcula el backend con las coordenadas (el teléfono no lo decide)
export class GetCountryAtUseCase {
    private countryRepository: CountryRepository;

    constructor({ countryRepository }: { countryRepository: CountryRepository }) {
        this.countryRepository = countryRepository;
    }

    async execute(lat: number, lng: number) {
        return await this.countryRepository.getCountryAt(lat, lng);
    }
}

// Tasas de cambio de referencia, para mostrar el precio aproximado en la moneda de la persona
export class GetExchangeRatesUseCase {
    private countryRepository: CountryRepository;

    constructor({ countryRepository }: { countryRepository: CountryRepository }) {
        this.countryRepository = countryRepository;
    }

    async execute() {
        return await this.countryRepository.getExchangeRates();
    }
}

export class CountryUseCases {
    getCountries: GetCountriesUseCase;
    getCountryAt: GetCountryAtUseCase;
    getExchangeRates: GetExchangeRatesUseCase;

    constructor({ countryRepository }: { countryRepository: CountryRepository }) {
        this.getCountries = new GetCountriesUseCase({ countryRepository });
        this.getCountryAt = new GetCountryAtUseCase({ countryRepository });
        this.getExchangeRates = new GetExchangeRatesUseCase({ countryRepository });
    }
}
