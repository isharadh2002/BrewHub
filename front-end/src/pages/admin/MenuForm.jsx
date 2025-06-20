// front-end/src/pages/admin/MenuForm.jsx
import {useState, useEffect} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {useForm, useFieldArray} from 'react-hook-form';
import menuService from '../../services/menuService';
import toast from 'react-hot-toast';
import {ArrowLeft, Plus, X, Save} from 'lucide-react';

const MenuForm = () => {
    const navigate = useNavigate();
    const {id} = useParams();
    const isEdit = !!id;

    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState('');

    const {
        register,
        handleSubmit,
        control,
        setValue,
        watch,
        formState: {errors}
    } = useForm({
        defaultValues: {
            name: '',
            category: 'coffee',
            price: '',
            description: '',
            longDescription: '',
            image: '',
            ingredients: [],
            nutritionalInfo: {
                calories: '',
                protein: '',
                carbs: '',
                fat: '',
                sugar: '',
                sodium: ''
            },
            allergens: [],
            customizations: [],
            isAvailable: true,
            isPopular: false,
            isSeasonal: false,
            tags: [],
            preparationTime: '',
            servingSize: ''
        }
    });

    const {fields: ingredientFields, append: appendIngredient, remove: removeIngredient} = useFieldArray({
        control,
        name: 'ingredients'
    });

    const {fields: tagFields, append: appendTag, remove: removeTag} = useFieldArray({
        control,
        name: 'tags'
    });

    const {
        fields: customizationFields,
        append: appendCustomization,
        remove: removeCustomization,
        update: updateCustomization
    } = useFieldArray({
        control,
        name: 'customizations'
    });

    const watchedImage = watch('image');

    useEffect(() => {
        if (isEdit) {
            fetchMenuItem();
        }
    }, [id]);

    useEffect(() => {
        setImagePreview(watchedImage);
    }, [watchedImage]);

    const fetchMenuItem = async () => {
        try {
            const response = await menuService.getItem(id);
            const item = response.data;

            // Set form values
            Object.keys(item).forEach(key => {
                if (key === 'ingredients' || key === 'tags') {
                    setValue(key, item[key].map(value => ({value})));
                } else if (key === 'customizations') {
                    setValue(key, item[key]);
                } else if (key === 'nutritionalInfo') {
                    setValue(key, item[key] || {});
                } else if (key === 'allergens') {
                    setValue(key, item[key] || []);
                } else {
                    setValue(key, item[key]);
                }
            });

            setImagePreview(item.image);
        } catch (error) {
            toast.error('Failed to load menu item');
            navigate('/admin/menu');
        }
    };

    const onSubmit = async (data) => {
        setLoading(true);

        try {
            // Transform data
            const formData = {
                ...data,
                price: parseFloat(data.price),
                ingredients: data.ingredients.map(ing => ing.value).filter(Boolean),
                tags: data.tags.map(tag => tag.value).filter(Boolean),
                preparationTime: data.preparationTime ? parseInt(data.preparationTime) : null,
                nutritionalInfo: Object.entries(data.nutritionalInfo).reduce((acc, [key, value]) => {
                    if (value) acc[key] = parseFloat(value);
                    return acc;
                }, {}),
                customizations: data.customizations
                    .filter(custom => custom.name && custom.options && custom.options.length > 0)
                    .map(custom => ({
                        ...custom,
                        options: custom.options.filter(opt => opt.name)
                    }))
            };

            if (isEdit) {
                await menuService.updateItem(id, formData);
                toast.success('Menu item updated successfully');
            } else {
                await menuService.createItem(formData);
                toast.success('Menu item created successfully');
            }

            navigate('/admin/menu');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save menu item');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const addCustomizationOption = (customizationIndex) => {
        const currentCustomization = customizationFields[customizationIndex];
        const updatedOptions = [...(currentCustomization.options || []), {name: '', priceModifier: 0}];
        updateCustomization(customizationIndex, {...currentCustomization, options: updatedOptions});
    };

    const removeCustomizationOption = (customizationIndex, optionIndex) => {
        const currentCustomization = customizationFields[customizationIndex];
        const updatedOptions = currentCustomization.options.filter((_, index) => index !== optionIndex);
        updateCustomization(customizationIndex, {...currentCustomization, options: updatedOptions});
    };

    const allergenOptions = [
        'dairy', 'eggs', 'gluten', 'nuts', 'soy', 'shellfish', 'fish'
    ];

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-6">
                <button
                    onClick={() => navigate('/admin/menu')}
                    className="flex items-center gap-2 text-gray-600 hover:text-brown-600"
                >
                    <ArrowLeft className="w-5 h-5"/>
                    Back to Menu Management
                </button>
            </div>

            <h1 className="text-2xl font-bold mb-6">
                {isEdit ? 'Edit Menu Item' : 'Add New Menu Item'}
            </h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold">Basic Information</h2>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                {...register('name', {required: 'Name is required'})}
                                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-brown-500"
                            />
                            {errors.name && (
                                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Category <span className="text-red-500">*</span>
                            </label>
                            <select
                                {...register('category', {required: 'Category is required'})}
                                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-brown-500"
                            >
                                <option value="coffee">Coffee</option>
                                <option value="tea">Tea</option>
                                <option value="pastries">Pastries</option>
                                <option value="sandwiches">Sandwiches</option>
                                <option value="desserts">Desserts</option>
                                <option value="beverages">Beverages</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Price <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                {...register('price', {required: 'Price is required', min: 0})}
                                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-brown-500"
                            />
                            {errors.price && (
                                <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Short Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                {...register('description', {required: 'Description is required', maxLength: 500})}
                                rows={3}
                                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-brown-500"
                            />
                            {errors.description && (
                                <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Long Description
                            </label>
                            <textarea
                                {...register('longDescription', {maxLength: 2000})}
                                rows={5}
                                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-brown-500"
                            />
                        </div>
                    </div>

                    {/* Image and Additional Info */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold">Image & Details</h2>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Image URL <span className="text-red-500">*</span>
                            </label>
                            <input
                                {...register('image', {required: 'Image URL is required'})}
                                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-brown-500"
                                placeholder="https://..."
                            />
                            {errors.image && (
                                <p className="text-red-500 text-sm mt-1">{errors.image.message}</p>
                            )}
                            {imagePreview && (
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="mt-2 w-full h-48 object-cover rounded-md"
                                    onError={(e) => {
                                        e.target.style.display = 'none'
                                    }}
                                />
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Preparation Time (minutes)
                            </label>
                            <input
                                type="number"
                                {...register('preparationTime', {min: 0})}
                                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-brown-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Serving Size
                            </label>
                            <input
                                {...register('servingSize')}
                                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-brown-500"
                                placeholder="e.g., 12 oz, Serves 2"
                            />
                        </div>

                        {/* Flags */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    {...register('isAvailable')}
                                    className="rounded"
                                />
                                <span className="text-sm font-medium">Available</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    {...register('isPopular')}
                                    className="rounded"
                                />
                                <span className="text-sm font-medium">Popular Item</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    {...register('isSeasonal')}
                                    className="rounded"
                                />
                                <span className="text-sm font-medium">Seasonal Item</span>
                            </label>
                        </div>

                        {/* Allergens */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Allergens</label>
                            <div className="grid grid-cols-2 gap-2">
                                {allergenOptions.map(allergen => (
                                    <label key={allergen} className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            value={allergen}
                                            {...register('allergens')}
                                            className="rounded"
                                        />
                                        <span className="text-sm capitalize">{allergen}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ingredients */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-lg font-semibold">Ingredients</h2>
                        <button
                            type="button"
                            onClick={() => appendIngredient({value: ''})}
                            className="text-sm text-brown-600 hover:text-brown-700 flex items-center gap-1"
                        >
                            <Plus className="w-4 h-4"/>
                            Add Ingredient
                        </button>
                    </div>
                    <div className="space-y-2">
                        {ingredientFields.map((field, index) => (
                            <div key={field.id} className="flex gap-2">
                                <input
                                    {...register(`ingredients.${index}.value`)}
                                    className="flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-brown-500"
                                    placeholder="Ingredient name"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeIngredient(index)}
                                    className="p-2 text-red-600 hover:text-red-700"
                                >
                                    <X className="w-5 h-5"/>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Nutritional Information */}
                <div>
                    <h2 className="text-lg font-semibold mb-2">Nutritional Information</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Calories</label>
                            <input
                                type="number"
                                {...register('nutritionalInfo.calories', {min: 0})}
                                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-brown-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Protein (g)</label>
                            <input
                                type="number"
                                step="0.1"
                                {...register('nutritionalInfo.protein', {min: 0})}
                                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-brown-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Carbs (g)</label>
                            <input
                                type="number"
                                step="0.1"
                                {...register('nutritionalInfo.carbs', {min: 0})}
                                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-brown-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Fat (g)</label>
                            <input
                                type="number"
                                step="0.1"
                                {...register('nutritionalInfo.fat', {min: 0})}
                                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-brown-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Sugar (g)</label>
                            <input
                                type="number"
                                step="0.1"
                                {...register('nutritionalInfo.sugar', {min: 0})}
                                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-brown-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Sodium (mg)</label>
                            <input
                                type="number"
                                {...register('nutritionalInfo.sodium', {min: 0})}
                                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-brown-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Customizations */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-lg font-semibold">Customizations</h2>
                        <button
                            type="button"
                            onClick={() => appendCustomization({
                                name: '',
                                required: false,
                                options: [{name: '', priceModifier: 0}]
                            })}
                            className="text-sm text-brown-600 hover:text-brown-700 flex items-center gap-1"
                        >
                            <Plus className="w-4 h-4"/>
                            Add Customization
                        </button>
                    </div>
                    <div className="space-y-4">
                        {customizationFields.map((field, index) => (
                            <div key={field.id} className="border rounded-md p-4">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1 space-y-3">
                                        <input
                                            {...register(`customizations.${index}.name`)}
                                            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-brown-500"
                                            placeholder="Customization name (e.g., Size, Milk Type)"
                                        />
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                {...register(`customizations.${index}.required`)}
                                                className="rounded"
                                            />
                                            <span className="text-sm">Required</span>
                                        </label>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeCustomization(index)}
                                        className="p-2 text-red-600 hover:text-red-700"
                                    >
                                        <X className="w-5 h-5"/>
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm font-medium">Options:</p>
                                    {field.options?.map((option, optIndex) => (
                                        <div key={optIndex} className="flex gap-2">
                                            <input
                                                {...register(`customizations.${index}.options.${optIndex}.name`)}
                                                className="flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-brown-500"
                                                placeholder="Option name"
                                            />
                                            <input
                                                type="number"
                                                step="0.01"
                                                {...register(`customizations.${index}.options.${optIndex}.priceModifier`)}
                                                className="w-32 px-3 py-2 border rounded-md focus:ring-2 focus:ring-brown-500"
                                                placeholder="Price +/-"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeCustomizationOption(index, optIndex)}
                                                className="p-2 text-red-600 hover:text-red-700"
                                            >
                                                <X className="w-5 h-5"/>
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => addCustomizationOption(index)}
                                        className="text-sm text-brown-600 hover:text-brown-700"
                                    >
                                        + Add Option
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tags */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-lg font-semibold">Tags</h2>
                        <button
                            type="button"
                            onClick={() => appendTag({value: ''})}
                            className="text-sm text-brown-600 hover:text-brown-700 flex items-center gap-1"
                        >
                            <Plus className="w-4 h-4"/>
                            Add Tag
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {tagFields.map((field, index) => (
                            <div key={field.id} className="flex gap-1 items-center">
                                <input
                                    {...register(`tags.${index}.value`)}
                                    className="px-3 py-1 border rounded-full focus:ring-2 focus:ring-brown-500"
                                    placeholder="Tag"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeTag(index)}
                                    className="p-1 text-red-600 hover:text-red-700"
                                >
                                    <X className="w-4 h-4"/>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end gap-4 pt-6 border-t">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/menu')}
                        className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-brown-600 text-white rounded-md hover:bg-brown-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        <Save className="w-4 h-4"/>
                        {loading ? 'Saving...' : (isEdit ? 'Update Item' : 'Create Item')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default MenuForm;