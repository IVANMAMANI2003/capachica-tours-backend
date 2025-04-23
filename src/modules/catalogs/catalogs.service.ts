import { supabase } from '../../config/supabase';
import { ApiError } from '../../core/errors/ApiError';

export const getCountries = async () => {
    const { data, error } = await supabase
        .from('countries')
        .select('id, name, code_iso')
        .order('name', { ascending: true });

    if (error) throw new ApiError(500, 'Could not retrieve countries', false, error.message);
    return data;
};

export const getSubdivisions = async (countryId?: number) => {
     let query = supabase
        .from('subdivisions')
        .select('id, name, country_id')
        .order('name', { ascending: true });

    if (countryId) {
        query = query.eq('country_id', countryId);
    }

    const { data, error } = await query;

    if (error) throw new ApiError(500, 'Could not retrieve subdivisions', false, error.message);
    return data;
};

// TODO: Añadir servicios CRUD para Admin si es necesario (createCountry, updateSubdivision, etc.)