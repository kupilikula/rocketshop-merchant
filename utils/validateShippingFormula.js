function validateShippingFormula(formula) {
    // Remove all whitespace for easier processing
    const cleanFormula = formula.replace(/\s+/g, '');

    // Check for balanced parentheses
    if (!hasBalancedParentheses(cleanFormula)) {
        return {
            isValid: false,
            error: 'Unbalanced parentheses in formula'
        };
    }

    // Check for valid operators and function calls
    const tokens = tokenizeFormula(cleanFormula);
    if (!tokens.isValid) {
        return {
            isValid: false,
            error: tokens.error
        };
    }

    return { isValid: true };
}

function hasBalancedParentheses(formula) {
    let count = 0;
    for (const char of formula) {
        if (char === '(') count++;
        if (char === ')') count--;
        if (count < 0) return false;
    }
    return count === 0;
}

function tokenizeFormula(formula) {
    const operatorRegex = /[\+\-\*\/]/;
    const functionRegex = /^(Max|Min|Floor|Ceil)\(/i;
    const numberRegex = /^\d+(\.\d+)?/;
    const variableRegex = /^(baseCost|itemCount|orderTotal)/;

    let pos = 0;
    let inFunctionCall = 0; // Track nested function calls

    while (pos < formula.length) {
        const remaining = formula.slice(pos);

        // Check for variables first
        const variableMatch = remaining.match(variableRegex);
        if (variableMatch) {
            pos += variableMatch[0].length;
            continue;
        }


        // Check for numbers
        const numberMatch = remaining.match(numberRegex);
        if (numberMatch) {
            pos += numberMatch[0].length;
            continue;
        }

        // Check for functions
        const functionMatch = remaining.match(functionRegex);
        if (functionMatch) {
            inFunctionCall++;
            pos += functionMatch[0].length;
            continue;
        }

        // Check for operators
        if (operatorRegex.test(formula[pos])) {
            pos++;
            continue;
        }

        // Check for parentheses
        if (formula[pos] === '(') {
            inFunctionCall++;
            pos++;
            continue;
        }

        if (formula[pos] === ')') {
            inFunctionCall--;
            pos++;
            continue;
        }

        // Allow commas within function calls
        if (formula[pos] === ',' && inFunctionCall > 0) {
            pos++;
            continue;
        }


        // If we reach here, we found an invalid character
        return {
            isValid: false,
            error: `Invalid character "${formula[pos]}" at position ${pos}`
        };
    }

    return { isValid: true };
}

module.exports= {validateShippingFormula}