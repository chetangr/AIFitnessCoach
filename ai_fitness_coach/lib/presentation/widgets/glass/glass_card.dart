import 'package:flutter/material.dart';
import 'dart:ui';

class GlassMorphicCard extends StatefulWidget {
  final Widget child;
  final EdgeInsetsGeometry? padding;
  final double blur;
  final Color? color;
  final BorderRadius? borderRadius;
  final double? width;
  final double? height;
  final bool enableAnimation;
  final Duration animationDuration;
  final VoidCallback? onTap;
  final double borderWidth;
  
  const GlassMorphicCard({
    Key? key,
    required this.child,
    this.padding,
    this.blur = 20,
    this.color,
    this.borderRadius,
    this.width,
    this.height,
    this.enableAnimation = true,
    this.animationDuration = const Duration(milliseconds: 600),
    this.onTap,
    this.borderWidth = 1.0,
  }) : super(key: key);

  @override
  State<GlassMorphicCard> createState() => _GlassMorphicCardState();
}

class _GlassMorphicCardState extends State<GlassMorphicCard> with TickerProviderStateMixin {
  late AnimationController _controller;
  late AnimationController _hoverController;
  late Animation<double> _scaleAnimation;
  late Animation<double> _opacityAnimation;
  late Animation<double> _blurAnimation;
  late Animation<double> _hoverAnimation;
  bool _isHovered = false;

  @override
  void initState() {
    super.initState();
    if (widget.enableAnimation) {
      _controller = AnimationController(
        vsync: this,
        duration: widget.animationDuration,
      );
      _hoverController = AnimationController(
        vsync: this,
        duration: const Duration(milliseconds: 200),
      );
      
      _scaleAnimation = Tween<double>(
        begin: 0.9,
        end: 1.0,
      ).animate(CurvedAnimation(
        parent: _controller,
        curve: Curves.easeOutBack,
      ));
      
      _opacityAnimation = Tween<double>(
        begin: 0.0,
        end: 1.0,
      ).animate(CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.0, 0.6, curve: Curves.easeOut),
      ));
      
      _blurAnimation = Tween<double>(
        begin: 0.0,
        end: widget.blur,
      ).animate(CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.3, 1.0, curve: Curves.easeOut),
      ));
      
      _hoverAnimation = Tween<double>(
        begin: 1.0,
        end: 1.02,
      ).animate(CurvedAnimation(
        parent: _hoverController,
        curve: Curves.easeInOut,
      ));
      
      _controller.forward();
    }
  }

  @override
  void dispose() {
    if (widget.enableAnimation) {
      _controller.dispose();
      _hoverController.dispose();
    }
    super.dispose();
  }

  void _handleHover(bool isHovered) {
    setState(() => _isHovered = isHovered);
    if (isHovered) {
      _hoverController.forward();
    } else {
      _hoverController.reverse();
    }
  }

  @override
  Widget build(BuildContext context) {
    Widget glassCard = MouseRegion(
      onEnter: (_) => _handleHover(true),
      onExit: (_) => _handleHover(false),
      child: GestureDetector(
        onTap: widget.onTap,
        onTapDown: (_) => _handleHover(true),
        onTapUp: (_) => _handleHover(false),
        onTapCancel: () => _handleHover(false),
        child: Container(
          width: widget.width,
          height: widget.height,
          decoration: BoxDecoration(
            borderRadius: widget.borderRadius ?? BorderRadius.circular(24),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.1),
                blurRadius: 30,
                offset: const Offset(0, 20),
                spreadRadius: -5,
              ),
              if (_isHovered)
                BoxShadow(
                  color: (widget.color ?? Colors.white).withOpacity(0.1),
                  blurRadius: 20,
                  offset: const Offset(0, 10),
                ),
            ],
          ),
          child: ClipRRect(
            borderRadius: widget.borderRadius ?? BorderRadius.circular(24),
            child: BackdropFilter(
              filter: ImageFilter.blur(
                sigmaX: widget.enableAnimation ? _blurAnimation.value : widget.blur,
                sigmaY: widget.enableAnimation ? _blurAnimation.value : widget.blur,
              ),
              child: Container(
                padding: widget.padding ?? const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  borderRadius: widget.borderRadius ?? BorderRadius.circular(24),
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      (widget.color ?? Colors.white).withOpacity(_isHovered ? 0.18 : 0.12),
                      (widget.color ?? Colors.white).withOpacity(_isHovered ? 0.08 : 0.05),
                    ],
                  ),
                  border: Border.all(
                    color: Colors.white.withOpacity(_isHovered ? 0.3 : 0.2),
                    width: widget.borderWidth,
                  ),
                ),
                child: widget.child,
              ),
            ),
          ),
        ),
      ),
    );

    if (widget.enableAnimation) {
      return AnimatedBuilder(
        animation: Listenable.merge([_controller, _hoverController]),
        builder: (context, child) => Transform.scale(
          scale: _scaleAnimation.value * _hoverAnimation.value,
          child: Opacity(
            opacity: _opacityAnimation.value,
            child: glassCard,
          ),
        ),
      );
    }
    
    return glassCard;
  }
}