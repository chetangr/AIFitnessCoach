import 'package:flutter/material.dart';
import 'dart:ui';

class GlassMorphicButton extends StatefulWidget {
  final String text;
  final VoidCallback? onPressed;
  final IconData? icon;
  final bool isPrimary;
  final double? width;
  final double? height;
  final EdgeInsetsGeometry? padding;
  final double fontSize;
  
  const GlassMorphicButton({
    Key? key,
    required this.text,
    this.onPressed,
    this.icon,
    this.isPrimary = false,
    this.width,
    this.height,
    this.padding,
    this.fontSize = 16,
  }) : super(key: key);

  @override
  State<GlassMorphicButton> createState() => _GlassMorphicButtonState();
}

class _GlassMorphicButtonState extends State<GlassMorphicButton> with TickerProviderStateMixin {
  late AnimationController _controller;
  late AnimationController _rippleController;
  late Animation<double> _scaleAnimation;
  late Animation<double> _rippleAnimation;
  bool _isPressed = false;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 150),
    );
    _rippleController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );
    
    _scaleAnimation = Tween<double>(
      begin: 1.0,
      end: 0.95,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: Curves.easeInOut,
    ));
    
    _rippleAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _rippleController,
      curve: Curves.easeOut,
    ));
  }

  @override
  void dispose() {
    _controller.dispose();
    _rippleController.dispose();
    super.dispose();
  }

  void _handleTapDown(TapDownDetails details) {
    if (widget.onPressed != null) {
      setState(() => _isPressed = true);
      _controller.forward();
      _rippleController.forward(from: 0);
    }
  }

  void _handleTapUp(TapUpDetails details) {
    if (widget.onPressed != null) {
      Future.delayed(const Duration(milliseconds: 100), () {
        setState(() => _isPressed = false);
        _controller.reverse();
        widget.onPressed!();
      });
    }
  }

  void _handleTapCancel() {
    setState(() => _isPressed = false);
    _controller.reverse();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: Listenable.merge([_controller, _rippleController]),
      builder: (context, child) => Transform.scale(
        scale: _scaleAnimation.value,
        child: Container(
          width: widget.width,
          height: widget.height ?? 56,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(20),
            boxShadow: widget.isPrimary ? [
              BoxShadow(
                color: const Color(0xFF007AFF).withOpacity(0.4),
                blurRadius: 25,
                offset: const Offset(0, 15),
                spreadRadius: -5,
              ),
            ] : [],
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(20),
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 15, sigmaY: 15),
              child: GestureDetector(
                onTapDown: _handleTapDown,
                onTapUp: _handleTapUp,
                onTapCancel: _handleTapCancel,
                child: Stack(
                  children: [
                    // Background
                    Container(
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(20),
                        gradient: widget.isPrimary
                            ? LinearGradient(
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                                colors: [
                                  const Color(0xFF007AFF).withOpacity(_isPressed ? 0.8 : 1.0),
                                  const Color(0xFF00C7BE).withOpacity(_isPressed ? 0.8 : 1.0),
                                ],
                              )
                            : LinearGradient(
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                                colors: [
                                  Colors.white.withOpacity(_isPressed ? 0.15 : 0.1),
                                  Colors.white.withOpacity(_isPressed ? 0.08 : 0.05),
                                ],
                              ),
                        border: widget.isPrimary
                            ? null
                            : Border.all(
                                color: Colors.white.withOpacity(0.2),
                                width: 1.5,
                              ),
                      ),
                    ),
                    // Ripple effect
                    if (_isPressed)
                      Positioned.fill(
                        child: Container(
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(20),
                            gradient: RadialGradient(
                              radius: _rippleAnimation.value * 2,
                              colors: [
                                Colors.white.withOpacity(0.3 * (1 - _rippleAnimation.value)),
                                Colors.white.withOpacity(0.0),
                              ],
                            ),
                          ),
                        ),
                      ),
                    // Content
                    Container(
                      padding: widget.padding ?? const EdgeInsets.symmetric(horizontal: 24),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          if (widget.icon != null) ...[
                            Icon(
                              widget.icon,
                              color: widget.isPrimary ? Colors.white : Colors.white.withOpacity(0.9),
                              size: 20,
                            ),
                            if (widget.text.isNotEmpty) const SizedBox(width: 10),
                          ],
                          if (widget.text.isNotEmpty)
                            Text(
                              widget.text,
                              style: TextStyle(
                                color: widget.isPrimary ? Colors.white : Colors.white.withOpacity(0.9),
                                fontSize: widget.fontSize,
                                fontWeight: FontWeight.w600,
                                letterSpacing: 0.5,
                              ),
                            ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}